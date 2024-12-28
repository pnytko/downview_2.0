from owslib.wms import WebMapService

# URL WMS
wms_url = "https://mapserver.bdl.lasy.gov.pl/ArcGIS/services/WMS_BDL_Mapa_turystyczna/MapServer/WMSServer"

# Pobieranie informacji o warstwach
wms = WebMapService(wms_url)

# Lista wszystkich warstw
layers = [(layer, wms[layer].title) for layer in wms.contents]

for layer_name, layer_title in layers:
    print(f"Layer Name: {layer_name}, Title: {layer_title}")
