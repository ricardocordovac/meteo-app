#!/bin/bash
curl -s -o /dev/null -w "%{http_code}" http://nas2gio:5100/api/Weather/update-meteo >> /volume1/Trabajos/Dockers/Backdbsuper/update_meteo.log 2>&1
echo " - $(date '+%Y-%m-%d %H:%M:%S')" >> /volume1/Trabajos/Dockers/Backdbsuper/update_meteo.log