/* -*- Mode: C; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 * vim:expandtab:autoindent:tabstop=4:shiftwidth=4:filetype=c:cindent:textwidth=0:
 *
 * Copyright (C) 2005 Dell Inc.
 *  by Michael Brown <Michael_E_Brown@dell.com>
 * Licensed under the Open Software License version 2.1
 *
 * Alternatively, you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published
 * by the Free Software Foundation; either version 2 of the License,
 * or (at your option) any later version.
 
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 */

#include "license.h"
#include <stdlib.h>
#include <string.h>

int
main (int argc, char **argv)
{

    int verbose = 0, dallas_result=0;
    char license_tmp[129];
    char license_file[129];
    char dallas[17];
    char system_name[33], vendor_name[33], mac[13];


    if (argc >1) verbose = 1;

    /* register algs, so they can be printed */
    register_algs();

    if (argc > 4) {
        getLicenseStubKeyEx(license_tmp, argv[1], argv[2], argv[3], argv[4]);

        strcpy(dallas, argv[1]);
        strcpy(system_name, argv[2]);
        strcpy(vendor_name, argv[3]);
        strcpy(mac, argv[4]);

    }else {
        getLicenseStubKey(license_tmp);

        getDallas(dallas);
        getSystemName(system_name);
        getVendorName(vendor_name);
        mac_addr_sys(mac);

    }

    if(verbose) {
    
        printf("dallas=%s\n", dallas);

        printf("system_name=%s\n", system_name);

        printf("vendor_name=%s\n", vendor_name);

        printf("mac_address=%s\n", mac);

        printf("license_stub=%s\n", license_tmp);

    }else {
        printf("%s", license_tmp);
    }

    return 0;
}

