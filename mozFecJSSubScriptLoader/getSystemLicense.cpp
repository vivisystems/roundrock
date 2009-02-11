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
#include <stdio.h>
#include <stdlib.h>


int
main (int argc, char **argv)
{

    int verbose = 0, dallas_result=0;
    char license_dallas[129] = "";
    char license_tmp[129];

    if (argc >1) verbose = 1;

    /* register algs, so they can be printed */
    register_algs();

   	fgets(license_tmp, 129, stdin);

    getLicenseFromStubKey(license_tmp, license_dallas);
    
    if (verbose == 1) {

        printf("license stub= %s \n", license_tmp);

        printf("license     = %s \n", license_dallas);

    }else {
        printf("%s", license_dallas);
    }

    return 0;
}

