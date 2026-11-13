#!/bin/bash
# Custom Godot 4.5.1 web template (no 3D/XR/net/gltf modules, size-optimised). Run inside docker.io/emscripten/emsdk:4.0.10
# with the 4.5.1-stable source mounted at /src. Do NOT pass deprecated=no (Dialogic and ControllerIcons need dict_to_inst, create()).
# Install: unzip result to ~/.cache/portfolio-godot/xdg/data/godot/export_templates/4.5.1.stable/web_nothreads_release.zip
set -e
pip install -q scons==4.8.1
cd /src
scons platform=web target=template_release threads=no optimize=size lto=auto disable_3d=yes disable_xr=yes javascript_eval=no module_text_server_fb_enabled=yes  module_csg_enabled=no module_gridmap_enabled=no module_gltf_enabled=no module_fbx_enabled=no module_openxr_enabled=no module_webxr_enabled=no module_camera_enabled=no module_mobile_vr_enabled=no module_theora_enabled=no module_jsonrpc_enabled=no module_enet_enabled=no module_websocket_enabled=no module_webrtc_enabled=no module_multiplayer_enabled=no module_upnp_enabled=no module_mbedtls_enabled=no module_lightmapper_rd_enabled=no module_raycast_enabled=no module_xatlas_unwrap_enabled=no module_vhacd_enabled=no module_tinyexr_enabled=no module_squish_enabled=no module_cvtt_enabled=no module_astcenc_enabled=no module_basis_universal_enabled=no module_etcpak_enabled=no module_hdr_enabled=no module_bmp_enabled=no module_tga_enabled=no module_dds_enabled=no module_ktx_enabled=no module_meshoptimizer__enabled=no module_ufbx_enabled=no module_mono_enabled=no module_text_server_adv_enabled=no -j20
ls -l bin
