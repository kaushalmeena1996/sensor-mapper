##
# Raspberry script for sending DHT11 sensor values to firebase database.
#

import RPi.GPIO as GPIO
import Adafruit_DHT
import time
import firebase_admin

GPIO.setmode(GPIO.BCM)
GPIO.cleanup()
GPIO.setwarnings(False)

# Firebase credentials
credentials = firebase_admin.credentials.cert({
    "type": "service_account",
    "project_id": "mapmysensor",
    "private_key_id": "715d0a62d89dace81462195237ed0256818908dc",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDPtNGFXphdLznl\nWRj2UjovtTDTs6h1YCe9bMhv79ETXTTuA/oCyusp0NdeqzaKd1YOjgA4CcVjuJDS\n0KGIxt5EcN7C+wuaW7PDiZSq3ufF8sNSpIRaLVzbHZk854QH6qzoQ5/L1ucsxFcF\n4kU5GqbxIg9C76UElfZdT7vBkbzSlrtcYkVujIu7GHhanzcIoJeHgxwxgXsba3xj\nTOIEwdskN9R8tOnVwSsyxlFS69ny1m83t4/XDf0ImVrMHzNpwWev8rOZNWHhcIpE\nrXqwGDU1o87ikJR5WRAZv9ewc5ZmzRFerrBpVXUDVwUCMv/353dtItoUYFgYW+dA\nHhyTy0hDAgMBAAECgf9zfu2tb94jgREBHQoU9624lzLpe7+KtIAiLu48M7qYDqki\nW3wEGwEkMTDmbqNlW4SWidFS+P+CqBnfyrFwTsYjd/UkNFgeLHeCImvGTCM2ZZyy\nNnPA84H/TAkUVMTO93tdmOeABGNh21m38JoSK4uo8l80yw0PQhtF0USH8WDjMxLQ\n4nU2bMBDyCSdRKJS3/H3akm+PtrqfXwq7WE0Qmi77xy1tgVjvHOMUPgPfR+4QkrE\netfxqEqoFdJ64s5cw/T48mGsemwIPdTsXNquAS1mVrQFUorD0ViOOHWyWpq8ntF1\nwNZDHOydVbB5mrqV3RryP22y/Yr8n5iceKPmxSUCgYEA9EKWe6EpaLfCJk+RhfYc\n6VuN+21yZ0Wmr9QkFrxg4cYSrzDhMqaK347iGBdnBH0SeRV9RWJp4XYqP1NMu+N9\naMh7WBySfo0Zig0m2QnnTDRkwPBY/35eMxTcwli/jH/ZSdtSzZ8fi/SCQZxT5tnZ\nXz8Y8OQsPPRQ774JUBn6qA8CgYEA2bB3rA3wij6Os6Qj/auoqaDV7n5LnK+ukG4M\nIoiJXeNF03H6KjtWjWbmDsr/W1zVF1sWH7tO7Yx+kJTBXhE+U3+zZhfyefkx+sIu\nz90x7ueskb7iacM3aJ6xolzvE38s7aI8R7yc8pKtldC2RLPin8xb5RZoBd4sfKoX\nE85/yI0CgYEA8O2ZRxqhIKRYgbdsP+mRfPAMrRq4hHrkPnyOmEp5eVkJZvpctrwl\nMPvbsY2r1HaVuQ9kQAMhkv0eENZWUuHB+o/9cdzE9sSwk0YDsoMdPUJUuyaXcnOv\n8My8L4qgbbJRnpMSKrWwxTiJHrRW4daxnUw8iqdVp04JY2BcCUGGxysCgYEAnFUP\nzF8CZLWCU95H/o+9g3w+xpSqhm7gRVbSniZByExERBJxXszYXpoME4mTEzC605gV\nblpc11nzNq+tonltshdeZa5C83eTfgrgBWVLy89S7iQQg3WvoBF/biOhifXl9Q5y\nje4VJFtUD+ggTXyF/s6LHB0YPUaN2kVoZ1AAEq0CgYEAiWoGETFqse/wh4I6goTJ\naObtgw4iCS+Pdq0ZxMEf3jjGhOWOwGD9krmQjDsVVHslY9dN76/uUbPPvRkItx6+\nuopxMVRmhQCbGCDoM4ZSy1Bre62p4SMJXLAJJPoZbyYIYVQXdJydEBZ4ifEE7aF5\nph0lNhrjwlkhhXG8z3/XiSQ=\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-yac5h@mapmysensor.iam.gserviceaccount.com",
    "client_id": "117420804203380275197",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-yac5h%40mapmysensor.iam.gserviceaccount.com"
})

# Sensor id for which data to be stored
sensor_id = "s001"

# Sensor abnormal limit
# Reading above which sensor status is changed to abnormal
abnormal_limit = 100

# Sensor failure limit
# Reading below which sensor status is changed to failure
failure_limit = 0

# Sensor should be set to Adafruit_DHT.DHT11,
# Adafruit_DHT.DHT22, or Adafruit_DHT.AM2302.
sensor = Adafruit_DHT.DHT11

# Example using a Beaglebone Black with DHT sensor
# connected to pin P8_11.
pin = 4

# Try to grab a sensor reading.  Use the read_retry method which will retry up
# to 15 times to get a sensor reading (waiting 2 seconds between each retry).
humidity, temperature = Adafruit_DHT.read_retry(sensor, pin)

# Initialize firebase app
firebase_admin.initialize_app(credentials, {
    'databaseURL': 'https://mapmysensor.firebaseio.com'
})

# Get a reference to the database service
db = firebase_admin.db.reference()

while True:
    humidity, temperature = Adafruit_DHT.read_retry(sensor, pin)

    if humidity is not None and temperature is not None:
        time.sleep(5)
        print(
            'Temperature={0:0.1f}*C  Humidity={1:0.1f}%'.format(temperature, humidity))

    else:
        print('Failed to get reading. Try again!')
        time.sleep(10)

    # Write data to database
    db.child('nodes').child(sensor_id).child('reading').update(
        {'value': temperature})
    db.child('values').child(sensor_id).push(
        {'value': temperature, 'timestamp': {'.sv': 'timestamp'}})

    # Stop loop if abnormal or failure reading detected
    if temperature > abnormal_limit or temperature < failure_limit:
        print('Status changed, exiting the loop...')
        break
