#!/usr/bin/env python3

import cgi
import cgitb
cgitb.enable()  # Show detailed error messages

print("Content-Type: application/json")
print()

try:
    print('{"status": "success", "message": "CGI script is working"}')
except Exception as e:
    print(f'{{"error": "{str(e)}"}}')
