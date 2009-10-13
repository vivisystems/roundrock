#!/bin/sh 
g++ -fPIC -fno-rtti -fno-exceptions -o getSystemLicenseStub getSystemLicenseStub.cpp license.cpp -I headers/ -L. -ldallas -lsmbios -ltomcrypt
strip getSystemLicenseStub
