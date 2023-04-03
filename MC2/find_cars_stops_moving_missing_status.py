import time
import geopy.distance
from geopy.exc import GeocoderTimedOut
import haversine as hs
import pandas as pd
import csv

data = pd.read_csv("./MC2/gps.csv", encoding="utf-8")
# newfile = open('./MC/updated-bfro-report-locations.csv', 'a+', newline='', encoding="utf-8")
# field_names = ['number','title','classification','timestamp','latitude','longitude','state','country']
# writer = csv.DictWriter(newfile, fieldnames=field_names)
# writer.writeheader()
# updated_data = pd.DataFrame()

def find_distance_between_two_points(point1, point2, attempt=1, max_attempts=6):
    try:
        return geopy.distance.geodesic(point1, point2)
    except GeocoderTimedOut:
        if attempt <= max_attempts:
            time.sleep(1.1*attempt)
            return find_distance_between_two_points(point1, point2, attempt=attempt+1)
        raise

i = 0
car_gps_mapping = {}
car_stops = {}

for index, row in data.iterrows():
    car_id = row['id']
    if not car_id in car_gps_mapping:
        car_gps_mapping[car_id] = []
    car_gps_mapping[car_id].append(row)
    if index>500:break

for car_id in car_gps_mapping.keys():
    j = 0
    print(car_id)
    prev_row = ""
    for row in car_gps_mapping[car_id]:
        if j == 0:
            prev_row = row
            j += 1
            continue
        prev_cordinates = (prev_row['lat'], prev_row['long'])
        current_cordinates = (row['lat'], row['long'])
        distance = find_distance_between_two_points(prev_cordinates, current_cordinates)
        print(str(car_id)+" "+str(distance))
        prev_row = row
        j += 1
        if j>0:break
