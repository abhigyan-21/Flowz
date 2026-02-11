import rasterio
import rasterio.warp
from rasterio.enums import Resampling
import numpy as np
import os

INPUT_LULC = r'D:\pre_et\wb_lulc_new.tif'
REFERENCE_DEM = r'D:\pre_et\wb_dem_new.tif'
BASE_DIR = r'D:\pre_et'

OUTPUT_TIF = os.path.join(BASE_DIR, 'mannings.tif')
OUTPUT_ASC = os.path.join(BASE_DIR, 'mannings.asc')
OUTPUT_MAP = os.path.join(BASE_DIR, 'mannings.map')

MAPPING_DICT = {
    0: 0.040, 1: 0.100, 2: 0.040, 4: 0.035,
    5: 0.035, 7: 0.015, 8: 0.030, 11: 0.050
}
DEFAULT_FRICTION = 0.040

def generate_friction_maps():
    print("🚀 Starting...")
    
    if not os.path.exists(INPUT_LULC) or not os.path.exists(REFERENCE_DEM):
        print("❌ Files missing.")
        return

    with rasterio.open(REFERENCE_DEM) as dem_src:
        dem_meta = dem_src.meta.copy()
        dem_shape = (dem_src.height, dem_src.width)
        dem_transform = dem_src.transform
        dem_crs = dem_src.crs

    aligned_lulc = np.zeros(dem_shape, dtype=np.uint8)
    with rasterio.open(INPUT_LULC) as lulc_src:
        rasterio.warp.reproject(
            source=rasterio.band(lulc_src, 1),
            destination=aligned_lulc,
            src_transform=lulc_src.transform,
            src_crs=lulc_src.crs,
            dst_transform=dem_transform,
            dst_crs=dem_crs,
            resampling=Resampling.nearest
        )

    print(f"🔍 Codes found in LULC: {np.unique(aligned_lulc)}")
    
    friction_data = np.full(dem_shape, DEFAULT_FRICTION, dtype=np.float32)
    for code, n_val in MAPPING_DICT.items():
        friction_data[aligned_lulc == code] = n_val

    # 1. SAVE TIFF
    dem_meta.update({"dtype": "float32", "nodata": -9999, "driver": "GTiff"})
    with rasterio.open(OUTPUT_TIF, "w", **dem_meta) as dst:
        dst.write(friction_data, 1)
    print(f"✅ Saved TIFF: {OUTPUT_TIF}")

    # 2. SAVE ASCII
    dem_meta.update({"driver": "AAIGrid"})
    with rasterio.open(OUTPUT_ASC, "w", **dem_meta) as dst:
        dst.write(friction_data, 1)
    print(f"✅ Saved ASCII: {OUTPUT_ASC}")

    # 3. SAVE .MAP (Direct binary write for PCRaster format)
    # Binary format write is complex; using rasterio's PCRaster driver if available
    try:
        dem_meta.update({
            "driver": "PCRaster",
            "PCRASTER_VALUESCALE": "VS_SCALAR"
        })
        with rasterio.open(OUTPUT_MAP, "w", **dem_meta) as dst:
            dst.write(friction_data, 1)
        print(f"✅ Saved PCRaster MAP: {OUTPUT_MAP}")
    except Exception as e:
        print(f"❌ Rasterio PCRaster Driver failed: {e}")
        print("💡 Try: pip install pcraster")

if __name__ == "__main__":
    generate_friction_maps()