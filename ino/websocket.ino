#include <ESP8266WiFi.h>
#include <WebSocketsServer.h>
#include <Adafruit_NeoPixel.h>

#define WIFI_SSID "Apto 32"
#define WIFI_PWD "10205300"
#define LED_W 19
#define LED_H 32
#define LED_COUNT ((LED_W * 2) + (LED_H * 2)) //STRIP LED (W x H)
#define PIN 0                                 //ESP8266
#define BRIGHTNESS 60                         //0-99

//https://www.youtube.com/watch?v=i0hqUdyi-dQ
// Parameter 1 = number of pixels in strip
// Parameter 2 = Arduino pin number (most are valid)
// Parameter 3 = pixel type flags, add together as needed:
//   NEO_KHZ800  800 KHz bitstream (most NeoPixel products w/WS2812 LEDs)
//   NEO_KHZ400  400 KHz (classic 'v1' (not v2) FLORA pixels, WS2811 drivers)
//   NEO_GRB     Pixels are wired for GRB bitstream (most NeoPixel products)
//   NEO_RGB     Pixels are wired for RGB bitstream (v1 FLORA pixels, not v2)
Adafruit_NeoPixel strip = Adafruit_NeoPixel(LED_COUNT, PIN, NEO_GRB + NEO_KHZ800);
WebSocketsServer webSocket = WebSocketsServer(80);

const char *ssid = WIFI_SSID;
const char *password = WIFI_PWD;
bool _blink = false;

void webSocketEvent(uint8_t num, WStype_t type, uint8_t *payload, size_t len)
{

  switch (type)
  {
  case WStype_DISCONNECTED:
    digitalWrite(LED_BUILTIN, 1); //OFF
    Serial.printf("[%u] Disconnected!\n", num);
    break;
  case WStype_CONNECTED:
  {
    digitalWrite(LED_BUILTIN, 0); // ON
    IPAddress ip = webSocket.remoteIP(num);
    Serial.printf("[%u] Connected!\n", num);
    Serial.println(ip);
  }
  break;
  case WStype_BIN:
  {
    uint8_t p, r, g, b, i = 0;
    uint8_t total = len / 3;
    while (i < total)
    {
      p = i * 3;
      r = payload[p];
      g = payload[p + 1];
      b = payload[p + 2];
      // Serial.printf("[%u] %u,%u,%u\n", i, r, g, b);
      strip.setPixelColor(i++, strip.Color(r, g, b));
    }
    strip.show();
  }
  break;
  default:
    break;
  }
}

void colorAll(byte r, byte g, byte b)
{
  for (uint8_t i = 0; i < LED_COUNT; i++)
  {
    strip.setPixelColor(i, strip.Color(r, g, b)); //change RGB 0-255
  }
  strip.show();
}

void setup()
{
  Serial.begin(115200);

  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, 1); // OFF

  strip.setBrightness(BRIGHTNESS);
  strip.begin();
  colorAll(0, 0, 0);

  Serial.println("Connecting");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED)
  {
    Serial.print(".");
    _blink = !_blink;
    if (_blink)
    {
      digitalWrite(LED_BUILTIN, HIGH);
      colorAll(255, 0, 0);
    }
    else
    {
      digitalWrite(LED_BUILTIN, LOW);
      colorAll(0, 0, 0);
    }
    delay(250);
  }
  digitalWrite(LED_BUILTIN, 1); // OFF
  colorAll(0, 255, 0);
  Serial.println("Connected!");
  Serial.println(WiFi.localIP());

  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
}

void loop()
{
  webSocket.loop();
}