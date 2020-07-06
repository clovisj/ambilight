#include <Adafruit_NeoPixel.h>
#ifdef __AVR__
#include <avr/power.h>
#endif

#define NUM_LEDS 32 //RING
#define PIN 0       //ESP8266
#define BRIGHTNESS 99
//https://www.youtube.com/watch?v=i0hqUdyi-dQ
// Parameter 1 = number of pixels in strip
// Parameter 2 = Arduino pin number (most are valid)
// Parameter 3 = pixel type flags, add together as needed:
//   NEO_KHZ800  800 KHz bitstream (most NeoPixel products w/WS2812 LEDs)
//   NEO_KHZ400  400 KHz (classic 'v1' (not v2) FLORA pixels, WS2811 drivers)
//   NEO_GRB     Pixels are wired for GRB bitstream (most NeoPixel products)
//   NEO_RGB     Pixels are wired for RGB bitstream (v1 FLORA pixels, not v2)
Adafruit_NeoPixel strip = Adafruit_NeoPixel(NUM_LEDS, PIN, NEO_GRB + NEO_KHZ800);
bool blinkOn = false;
// IMPORTANT: To reduce NeoPixel burnout risk, add 1000 uF capacitor across
// pixel power leads, add 300 - 500 Ohm resistor on first pixel's data input
// and minimize distance between Arduino and first pixel.  Avoid connecting
// on a live circuit...if you must, connect GND first.
int TOTAL = (NUM_LEDS * 3) + 1;
int DATA[(NUM_LEDS * 3) + 1];

void setup2()
{
    Serial.begin(9600);
    pinMode(LED_BUILTIN, OUTPUT);
    strip.setBrightness(BRIGHTNESS);
    strip.begin();
    strip.show(); // Initialize all pixels to 'off'
    clearStrip();

    for (int i = 0; i < TOTAL; i++)
    {
        DATA[i] = 0;
    }
}

void loop2()
{
    blinkOn = !blinkOn;
    digitalWrite(LED_BUILTIN, blinkOn ? HIGH : LOW);
}

void clearStrip()
{
    for (int i = 0; i < NUM_LEDS; i++)
    {
        strip.setPixelColor(i, strip.Color(0, 0, 0)); //change RGB color value here
    }
    strip.show();
}

void setAll(byte r, byte g, byte b)
{
    for (int i = 0; i < NUM_LEDS; i++)
    {
        strip.setPixelColor(i, strip.Color(r, g, g)); //change RGB color value here
    }
    strip.show();
}
void split(String value)
{
    char data[value.length() + 1];
    value.toCharArray(data, value.length() + 1);

    int i = 0;
    char delim[] = ",";
    char *ptr = strtok(data, delim);
    while (ptr != NULL)
    {
        DATA[i++] = atoi(ptr);
        ptr = strtok(NULL, delim);
    }
}
void setCustom(String data)
{
    split(data);
    int length = DATA[0];
    Serial.println(length);
    for (int i = 0; i < length; i++)
    {
        int v = (i * 3) + 1;
        int r = DATA[v];
        int g = DATA[v + 1];
        int b = DATA[v + 2];
        strip.setPixelColor(i, strip.Color(r, g, b)); //change RGB color value here
    }
    strip.show();
}
