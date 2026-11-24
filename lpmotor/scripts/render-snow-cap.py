"""Render the snow-cap source image with Blender in background mode."""
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector


def point_at(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()


def area_light(name, position, energy, color, size):
    light = bpy.data.lights.new(name, "AREA")
    light.energy, light.color, light.size = energy, color, size
    obj = bpy.data.objects.new(name, light)
    bpy.context.collection.objects.link(obj)
    obj.location = position
    point_at(obj, (0, 0, 0))


bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.cycles.samples = 32
scene.cycles.use_denoising = True
scene.render.film_transparent = True
scene.render.resolution_x = 1000
scene.render.resolution_y = 280
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"
scene.view_settings.view_transform = "AgX"
scene.view_settings.exposure = 0.46

world = bpy.data.worlds.new("Blue bounce")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.58, 0.69, 0.87, 1)
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.46
scene.world = world

material = bpy.data.materials.new("Fine powder snow")
material.use_nodes = True
nodes, links = material.node_tree.nodes, material.node_tree.links
surface = nodes["Principled BSDF"]
surface.inputs["Base Color"].default_value = (0.90, 0.95, 1.0, 1)
surface.inputs["Roughness"].default_value = 0.69
surface.inputs["Subsurface Weight"].default_value = 0.045
grain = nodes.new("ShaderNodeTexNoise")
grain.inputs["Scale"].default_value = 93
grain.inputs["Detail"].default_value = 3
bump = nodes.new("ShaderNodeBump")
bump.inputs["Strength"].default_value = 0.33
bump.inputs["Distance"].default_value = 0.029
links.new(grain.outputs["Fac"], bump.inputs["Height"])
links.new(bump.outputs["Normal"], surface.inputs["Normal"])

slices, ring = 220, 48
vertices, faces = [], []
for column in range(slices + 1):
    t = column / slices
    edge = min(1.0, max(0.001, min(t, 1 - t) / 0.17)) ** 0.83
    mounds = sum(
        height * math.exp(-((t - center) / spread) ** 2)
        for center, spread, height in [
            (0.18, 0.057, 0.11),
            (0.31, 0.083, 0.22),
            (0.49, 0.075, 0.30),
            (0.65, 0.071, 0.19),
            (0.80, 0.078, 0.15),
        ]
    )
    crest = edge * (0.13 + mounds + 0.016 * math.sin(t * 112))
    for step in range(ring):
        angle = step * math.tau / ring
        sine = math.sin(angle)
        y = 0.31 * edge * math.cos(angle)
        grain_offset = math.sin(t * 779 + step * 8.43) * 0.006
        z = crest * sine ** 0.72 if sine >= 0 else 0.035 * edge * sine
        vertices.append(((t - 0.5) * 6.15, y, z + grain_offset * edge))
        if column:
            right = column * ring + step
            right_next = column * ring + (step + 1) % ring
            faces.append((right - ring, right_next - ring, right_next, right))
faces.extend((tuple(reversed(range(ring))), tuple(range(slices * ring, (slices + 1) * ring))))
mesh = bpy.data.meshes.new("Snow bank")
mesh.from_pydata(vertices, [], faces)
mesh.update()
bank = bpy.data.objects.new("Accumulated powder", mesh)
bpy.context.collection.objects.link(bank)
bank.data.materials.append(material)
for face in mesh.polygons:
    face.use_smooth = True

area_light("Softbox", (-3.8, -4.5, 6.1), 1080, (1.0, 0.94, 0.85), 5.0)
area_light("Cool fill", (3.5, -2.8, 3.0), 480, (0.62, 0.78, 1.0), 5.0)
area_light("Rim", (0.0, 3.2, 4.0), 660, (0.84, 0.92, 1.0), 5.5)

bpy.ops.object.camera_add(location=(0, -10, 2.05))
camera = bpy.context.object
camera.data.type = "ORTHO"
camera.data.ortho_scale = 6.65
point_at(camera, (0, 0, 0.15))
scene.camera = camera
scene.render.filepath = str(Path(sys.argv[sys.argv.index("--") + 1]).resolve())
bpy.ops.render.render(write_still=True)
