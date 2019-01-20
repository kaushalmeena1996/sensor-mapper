##
# Raspberry script for sending DHT11 sensor values to firebase database.
#

import RPi.GPIO as GPIO
import pyrebase
import Adafruit_DHT
import time

GPIO.setmode(GPIO.BCM)
GPIO.cleanup()
GPIO.setwarnings(False)

# Firebase configuration
config = {
    "apiKey": "AIzaSyCHZINWnMlvnlvcetBETCzqEMnh3aYtveU",
    "authDomain": "mapmysensor.firebaseapp.com",
    "databaseURL": "https://mapmysensor.firebaseio.com",
    "projectId": "mapmysensor",
    "storageBucket": "mapmysensor.appspot.com",
    "messagingSenderId": "833622353265"
}

# Firebase user login details
email = "sensor1@mms.com"
password = "123456"

# Sensor id for which data to be stored
sensor_id = "s001"

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
firebase = pyrebase.initialize_app(config)

# Log the user in
user = firebase.auth().sign_in_with_email_and_password(email, password)

# Get a reference to the database service
db = firebase.database()

# Get starting time
time1 = time.time()

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
    db.child('nodes').child(sensor_id).update(
        {'value': temperature}, user['idToken'])
    db.child('values').child(sensor_id).push(
        {'value': temperature, 'timestamp': {'.sv': 'timestamp'}}, user['idToken'])

    # Stop loop if abnormal temperature detected
    if temperature > 99 or temperature < 1:
        break

    # Get ending time
    time2 = time.time()

    # Calculate time difference in seconds
    seconds = time2 - time1

    if seconds > 1800:
        # Store previous time
        time1 = time2

        # Referesh user token
        user = firebase.auth().refresh(user['refreshToken'])
