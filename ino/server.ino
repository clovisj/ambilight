/*
  WiFiHTTPSServer - Simple SSL server example

  This sketch demonstrates how to set up a simple HTTP-like server usingcl
  HTTPS encryption. This is NOT the recommended way of writing a web server!
  Please see the ESP8266WebServer and ESP8266WebServerSecure for a much easier
  and more robust server for your own applications.

  The server will set a GPIO pin depending on the request
    https://server_ip/gpio/0 will set the GPIO2 low,
    https://server_ip/gpio/1 will set the GPIO2 high
  server_ip is the IP address of the ESP8266 module, will be
  printed to Serial when the module is connected.
*/

#include <ESP8266WiFi.h>

#ifndef STASSID
#define STASSID "Apto 32"
#define STAPSK "10205300"
#endif

const char *ssid = STASSID;
const char *password = STAPSK;

// Create an instance of the server
// specify the port to listen on as an argument
WiFiServer server(80);

void setup()
{
    Serial.begin(9600);
    // prepare LED
    pinMode(LED_BUILTIN, OUTPUT);
    digitalWrite(LED_BUILTIN, 0);

    // Connect to WiFi network
    Serial.println();
    Serial.println();
    Serial.print("Connecting to ");
    Serial.println(ssid);

    WiFi.mode(WIFI_STA); //This line hides the viewing of ESP as wifi hotspot //WIFI_STA It's very important !!!!
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }
    Serial.println("");
    Serial.println("WiFi connected");

    // Start the server
    server.begin();
    Serial.println("Server started");

    // Print the IP address
    Serial.println(WiFi.localIP());

    setup2();
}

void loop()
{
    // Check if a client has connected
    WiFiClient client = server.available();
    if (!client)
    {
        return;
    }

    // Wait until the client sends some data
    Serial.println("new client");
    unsigned long timeout = millis() + 3000;
    while (!client.available() && millis() < timeout)
    {
        delay(1);
    }
    if (millis() > timeout)
    {
        Serial.println("timeout");
        client.flush();
        client.stop();
        return;
    }

    // Read the first line of the request
    String req = client.readStringUntil('H'); //end with HTTP
    req.trim();
    Serial.println(req);
    client.flush();

    // Match the request
    int val;
    if (req.indexOf("/gpio/0") != -1)
    {
        val = 0;
    }
    else if (req.indexOf("/gpio/1") != -1)
    {
        val = 1;
    }
    else if (req.indexOf("/?leds=") != -1)
    {
        int i = req.indexOf("/?leds=") + 7;
        String res = req.substring(i);
        setCustom(res);
        val = 1;
    }
    else
    {
        Serial.println("invalid request");
        client.print("HTTP/1.1 404 Not Found\r\nContent-Type: text/html\r\n\r\n<!DOCTYPE HTML>\r\n<html><body>Not found</body></html>");
        return;
    }

    // Set GPIO2 according to the request
    digitalWrite(LED_BUILTIN, val);

    client.flush();

    // Prepare the response
    String s = "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n<!DOCTYPE HTML>\r\n<html>\r\nGPIO is now ";
    s += (val) ? "high" : "low";
    s += "</html>\n";

    // Send the response to the client
    client.print(s);
    delay(1);
    Serial.println("Client disconnected");

    // The client will actually be disconnected
    // when the function returns and 'client' object is detroyed
}
