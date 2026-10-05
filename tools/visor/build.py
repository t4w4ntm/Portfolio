"""Fit an opaque, rigid visor to the preserved original astronaut rig.

Requires NumPy and Pillow. Retains the original character geometry, texture,
skeleton and animations; adds the visor, seals the opening, and adjusts lower
helmet weights.
"""
from pathlib import Path
import json
import struct
import numpy as np
from PIL import Image
from io import BytesIO

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'model-backups/model-before-new-astronaut.glb'
raw = SOURCE.read_bytes()
json_len = struct.unpack_from('<I', raw, 12)[0]
doc = json.loads(raw[20:20 + json_len])
binary = bytearray(raw[28 + json_len:])
head = next(i for i, n in enumerate(doc['nodes']) if n.get('name') == 'Head')
head_joint = doc['skins'][0]['joints'].index(head)

def add_accessor(array, kind, target=34962):
    array = np.ascontiguousarray(array)
    while len(binary) % 4:
        binary.append(0)
    offset = len(binary)
    payload = array.tobytes()
    binary.extend(payload)
    vi = len(doc['bufferViews'])
    doc['bufferViews'].append({'buffer': 0, 'byteOffset': offset,
                             'byteLength': len(payload), 'target': target})
    component = {'float32': 5126, 'uint16': 5123, 'uint32': 5125}[str(array.dtype)]
    ai = len(doc['accessors'])
    acc = {'bufferView': vi, 'componentType': component,
           'count': len(array), 'type': kind}
    if kind == 'VEC3' and target == 34962:
        acc['min'] = array.min(axis=0).tolist()
        acc['max'] = array.max(axis=0).tolist()
    doc['accessors'].append(acc)
    return ai

def primitive(vertices, triangles, material):
    p = np.asarray(vertices, dtype=np.float32)
    t = np.asarray(triangles, dtype=np.uint32).reshape(-1, 3)
    normals = np.zeros_like(p)
    fn = np.cross(p[t[:, 1]] - p[t[:, 0]], p[t[:, 2]] - p[t[:, 0]])
    for k in range(3):
        np.add.at(normals, t[:, k], fn)
    # Weld coincident ring seams before computing smooth normals.
    _, inverse = np.unique(np.round(p * 1e6).astype(np.int32), axis=0, return_inverse=True)
    combined = np.zeros((inverse.max() + 1, 3), dtype=np.float32)
    np.add.at(combined, inverse, normals)
    normals = combined[inverse]
    normals /= np.maximum(np.linalg.norm(normals, axis=1, keepdims=True), 1e-20)
    joints = np.zeros((len(p), 4), dtype=np.uint16)
    weights = np.zeros((len(p), 4), dtype=np.float32)
    joints[:, 0] = head_joint
    weights[:, 0] = 1
    return {
        'attributes': {
            'POSITION': add_accessor(p, 'VEC3'),
            'NORMAL': add_accessor(normals, 'VEC3'),
            'JOINTS_0': add_accessor(joints, 'VEC4'),
            'WEIGHTS_0': add_accessor(weights, 'VEC4'),
        },
        'indices': add_accessor(t.reshape(-1), 'SCALAR', 34963),
        'material': material,
    }

# Opening follows the original helmet's raised brow and projecting lower rim.
A, B, CY = .385, .300, 1.180
def surface(r, angle):
    u, v = r * np.cos(angle), r * np.sin(angle)
    z = .200 + .040 * v + .160 * v * v + .270 * np.sqrt(max(0, 1 - r * r))
    return np.array([A * u, CY + B * v, z])

visor_material = len(doc['materials'])
doc['materials'].append({
    'name': 'Opaque smoked graphite visor', 'alphaMode': 'OPAQUE',
    'doubleSided': True,
    'pbrMetallicRoughness': {
        'baseColorFactor': [.018, .026, .038, 1],
        'metallicFactor': .88, 'roughnessFactor': .17,
    },
    'extensions': {'KHR_materials_clearcoat': {
        'clearcoatFactor': 1, 'clearcoatRoughnessFactor': .10,
    }},
    'extras': {'opacity': 1, 'transmission': 0, 'rig': '100% Head joint'},
})
gasket_material = len(doc['materials'])
doc['materials'].append({
    'name': 'Visor graphite edge gasket', 'alphaMode': 'OPAQUE', 'doubleSided': True,
    'pbrMetallicRoughness': {
        'baseColorFactor': [.013, .018, .024, 1],
        'metallicFactor': .15, 'roughnessFactor': .45,
    },
})
used = doc.setdefault('extensionsUsed', [])
if 'KHR_materials_clearcoat' not in used:
    used.append('KHR_materials_clearcoat')

around, rings = 160, 64
verts = [surface(0, 0)]
for j in range(1, rings + 1):
    # More samples near the rim, where the surface curvature changes fastest.
    r = np.sin(j / rings * np.pi / 2)
    verts.extend(surface(r, k / around * np.pi * 2) for k in range(around))
tris = []
for k in range(around):
    tris.append([0, 1 + k, 1 + (k + 1) % around])
for j in range(rings - 1):
    start = 1 + j * around
    for k in range(around):
        a, b = start + k, start + (k + 1) % around
        tris.extend([[a, a + around, b], [b, a + around, b + around]])
doc['meshes'][0]['primitives'].append(primitive(verts, tris, visor_material))

# A narrow gasket seals the new visor against the existing textured white rim.
verts, tris = [], []
sides = 12
for i in range(around):
    angle = i / around * np.pi * 2
    center = surface(1, angle)
    tangent = surface(1, angle + .0001) - surface(1, angle - .0001)
    tangent /= np.linalg.norm(tangent)
    sideways = np.cross(tangent, [0, 0, 1])
    sideways /= np.linalg.norm(sideways)
    normal = np.cross(sideways, tangent)
    for j in range(sides):
        phi = j / sides * np.pi * 2
        verts.append(center + .006 * (sideways * np.cos(phi) + normal * np.sin(phi)))
        a = i * sides + j
        b = i * sides + (j + 1) % sides
        c = ((i + 1) % around) * sides + j
        d = ((i + 1) % around) * sides + (j + 1) % sides
        tris.extend([[a, c, b], [b, c, d]])
doc['meshes'][0]['primitives'].append(primitive(verts, tris, gasket_material))

# Recessed opaque flange closes the side gap between the visor and the old rim.
# Its rear edge penetrates the helmet, so hair or skin cannot show at oblique angles.
verts, tris = [], []
for k in range(around):
    angle = k / around * np.pi * 2
    edge = surface(1, angle)
    verts.append(edge)
    verts.append([edge[0] * 1.05, CY + (edge[1] - CY) * (1.20 if edge[1] < CY else 1.025), .07])
    a = k * 2
    b = ((k + 1) % around) * 2
    tris.extend([[a, a + 1, b], [b, a + 1, b + 1]])
doc['meshes'][0]['primitives'].append(primitive(verts, tris, gasket_material))


# Give the enclosed inner face an opaque liner material as well. The original
# chin blends through the neck rig; this prevents the textured skin appearing
# through an intermittent gap underneath the old animated helmet rim.
def read_accessor(index):
    a = doc['accessors'][index]
    view = doc['bufferViews'][a['bufferView']]
    size = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[a['type']]
    dtype = {5126: '<f4', 5125: '<u4', 5123: '<u2', 5121: 'u1'}[a['componentType']]
    return np.frombuffer(binary, dtype=dtype, count=a['count'] * size,
                         offset=view.get('byteOffset', 0) + a.get('byteOffset', 0)).reshape(-1, size).copy()
base = doc['meshes'][0]['primitives'][0]
positions = read_accessor(base['attributes']['POSITION'])
triangles = read_accessor(base['indices']).reshape(-1, 3)
centres = positions[triangles].mean(axis=1)
x, y, z = centres.T
uv = read_accessor(base['attributes']['TEXCOORD_0'])
image_view = doc['bufferViews'][doc['images'][0]['bufferView']]
image_start = image_view.get('byteOffset', 0)
image = np.asarray(Image.open(BytesIO(bytes(binary[image_start:image_start+image_view['byteLength']]))).convert('RGB'))
uvc = uv[triangles].mean(axis=1)
colour = image[np.clip((uvc[:,1]*(image.shape[0]-1)).astype(int),0,image.shape[0]-1),np.clip((uvc[:,0]*(image.shape[1]-1)).astype(int),0,image.shape[1]-1)].astype(float)
skin = (colour[:,0]-colour[:,1]>14) & (colour[:,1]-colour[:,2]>9) & (colour[:,0]>85)
mask = (abs(x)<.33) & (z>.15) & (y>.855) & (y<1.045) & skin

# The lower helmet rim originally inherited shoulder motion. Tie its outer
# shell to Head as well, fading into the narrower neck/suit region.
def smoothstep(a,b,v):
    t=np.clip((v-a)/(b-a),0,1)
    return t*t*(3-2*t)
px,py,pz=positions.T
outer=smoothstep(.76,.80,py)*smoothstep(.22,.28,np.sqrt(px*px+pz*pz))
rigid=np.maximum(smoothstep(.82,.90,py),outer)
joint_ids=read_accessor(base['attributes']['JOINTS_0'])
old_weights=read_accessor(base['attributes']['WEIGHTS_0'])
for start in range(0,len(positions),20000):
    end=min(start+20000,len(positions));dense=np.zeros((end-start,len(doc['skins'][0]['joints'])),dtype=np.float32)
    for k in range(4):np.add.at(dense,(np.arange(end-start),joint_ids[start:end,k]),old_weights[start:end,k])
    dense*=1-rigid[start:end,None];dense[:,head_joint]+=rigid[start:end]
    order=np.argsort(dense,axis=1)[:,-4:][:,::-1];chosen=np.take_along_axis(dense,order,axis=1);chosen/=chosen.sum(axis=1,keepdims=True);order[chosen==0]=0
    joint_ids[start:end]=order;old_weights[start:end]=chosen
for key,array in [('JOINTS_0',joint_ids),('WEIGHTS_0',old_weights)]:
    acc=doc['accessors'][base['attributes'][key]];view=doc['bufferViews'][acc['bufferView']];offset=view.get('byteOffset',0)+acc.get('byteOffset',0);data=np.ascontiguousarray(array).tobytes();binary[offset:offset+len(data)]=data
liner_material = len(doc['materials'])
doc['materials'].append({'name': 'Opaque inner helmet liner', 'alphaMode': 'OPAQUE', 'doubleSided': True,
    'pbrMetallicRoughness': {'baseColorFactor': [.006, .009, .014, 1], 'metallicFactor': 0, 'roughnessFactor': .85}})
base['indices'] = add_accessor(triangles[~mask].astype(np.uint32).reshape(-1), 'SCALAR', 34963)
doc['meshes'][0]['primitives'].append({'attributes': dict(base['attributes']),
    'indices': add_accessor(triangles[mask].astype(np.uint32).reshape(-1), 'SCALAR', 34963), 'material': liner_material})

doc['buffers'][0]['byteLength'] = len(binary)
js = json.dumps(doc, separators=(',', ':')).encode()
js += b' ' * (-len(js) % 4)
binary += b'\0' * (-len(binary) % 4)
output = (struct.pack('<III', 0x46546c67, 2, 28 + len(js) + len(binary))
          + struct.pack('<II', len(js), 0x4e4f534a) + js
          + struct.pack('<II', len(binary), 0x004e4942) + binary)
(ROOT / 'astronaut-visor.glb').write_bytes(output)
print(json.dumps({'source': str(SOURCE), 'output': 'astronaut-visor.glb',
                  'head_joint': head_joint, 'visor_alpha_mode': 'OPAQUE',
                  'animations': [a['name'] for a in doc['animations']],
                  'bytes': len(output)}, indent=2))
