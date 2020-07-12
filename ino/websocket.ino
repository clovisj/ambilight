#include <ESP8266WiFi.h>
#include <WebSocketsServer.h>
#include <Adafruit_NeoPixel.h>

#define WIFI_SSID "Apto 32"
#define WIFI_PWD "10205300"
#define LED_MAX 100   //STRIP LED (MAX)
#define PIN 0         //ESP8266
#define BRIGHTNESS 99 //0-255

IPAddress local_IP(192, 168, 100, 27);
IPAddress gateway(192, 168, 100, 1);
IPAddress subnet(255, 255, 255, 0);

WebSocketsServer webSocket = WebSocketsServer(80);

const char *ssid = WIFI_SSID;
const char *password = WIFI_PWD;
const char RES_OK[] = "{\"ok\":true}";
bool _blink = false;
bool _ready = false;
uint16_t _ledMax = LED_MAX;
Adafruit_NeoPixel strip = Adafruit_NeoPixel(LED_MAX, PIN, NEO_GRB + NEO_KHZ800);

void webSocketEvent(uint8_t num, WStype_t type, uint8_t *payload, size_t len)
{

  switch (type)
  {
  case WStype_DISCONNECTED:
  {
    blink(false);
    colorAll(0, 0, 0);
    Serial.printf("[%u] Disconnected!\n", num);
  }
  break;
  case WStype_CONNECTED:
  {
    blink(true);
    IPAddress ip = webSocket.remoteIP(num);
    Serial.printf("[%u] Connected!\n", num);
    Serial.println(ip);
  }
  break;
  case WStype_TEXT:
  {
    char *req = (char *)payload;
    Serial.printf("[%u] %s\n", num, req);
    switch (req[0])
    {
    case '#':
    {
      config(String(req[1] + req[2]).toInt(), String(req[3] + req[4] + req[5]).toInt(), String(req[6] + req[7] + req[8]).toInt());
      webSocket.sendTXT(num, RES_OK, strlen(RES_OK));
      colorAll(0, 255, 0);
      delay(250);
      colorAll(0, 0, 0);
      delay(250);
      colorAll(0, 255, 0);
      delay(250);
      colorAll(0, 0, 0);
      delay(250);
      colorAll(0, 255, 0);
      delay(250);
      colorAll(0, 0, 0);
    }
    break;
    default:
      break;
    }
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
void config(uint8_t pin, byte brightness, uint16_t ledMax)
{
  colorAll(0, 0, 0); //reset
  //https://www.youtube.com/watch?v=i0hqUdyi-dQ
  // Parameter 1 = number of pixels in strip
  // Parameter 2 = Arduino pin number (most are valid)
  // Parameter 3 = pixel type flags, add together as needed:
  //   NEO_KHZ800  800 KHz bitstream (most NeoPixel products w/WS2812 LEDs)
  //   NEO_KHZ400  400 KHz (classic 'v1' (not v2) FLORA pixels, WS2811 drivers)
  //   NEO_GRB     Pixels are wired for GRB bitstream (most NeoPixel products)
  //   NEO_RGB     Pixels are wired for RGB bitstream (v1 FLORA pixels, not v2)
  //  strip = Adafruit_NeoPixel(ledMax, pin, NEO_GRB + NEO_KHZ800);
  strip.setBrightness(brightness);
  strip.begin();
  _ledMax = ledMax;
  _ready = true;
  _blink = true;
  blink(true);
}
void colorAll(byte r, byte g, byte b)
{
  if (!_ready)
  {
    return;
  }
  for (uint16_t i = 0; i < _ledMax; i++)
  {
    strip.setPixelColor(i, strip.Color(r, g, b)); //change RGB 0-255
  }
  strip.show();
}
void blink(bool force)
{
  _blink = !_blink;
  if (force && _blink)
  {
    digitalWrite(LED_BUILTIN, HIGH); // ON
  }
  else
  {
    digitalWrite(LED_BUILTIN, LOW); // OFF
  }
}

void setup()
{
  Serial.begin(115200);

  pinMode(LED_BUILTIN, OUTPUT);

  config(PIN, BRIGHTNESS, LED_MAX);
  blink(false);

  Serial.println("Connecting");
  WiFi.config(local_IP, gateway, subnet);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(250);
    Serial.print(".");
    blink(true);
    colorAll(_blink ? 255 : 0, 0, 0); //blink red
  }

  colorAll(0, 0, 0); //turn all off

  Serial.println("Connected!");
  Serial.println(WiFi.localIP());

  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
}

void loop()
{
  webSocket.loop();
}