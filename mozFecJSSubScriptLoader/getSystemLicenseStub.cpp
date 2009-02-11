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

    getLicenseStubKey(license_tmp);

    if(verbose) {
    
        getDallas(dallas);
        printf("dallas = %s \n", dallas);

        getSystemName(system_name);
        printf("system = %s \n", system_name);

        getVendorName(vendor_name);
        printf("vendor = %s \n", vendor_name);

        mac_addr_sys(mac);
        printf("mac address = %s \n", mac);

        getLicenseStubKey(license_tmp);
        printf("license stub= %s \n", license_tmp);


    }else {
        printf("%s", license_tmp);
    }

    return 0;
}

