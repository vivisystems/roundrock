/* -*- Mode: C++; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 * vim: set ts=4 sw=4 et tw=80:
 *
 * ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Mozilla Communicator client code, released
 * March 31, 1998.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1998
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Robert Ginda <rginda@netscape.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either of the GNU General Public License Version 2 or later (the "GPL"),
 * or the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

#if !defined(XPCONNECT_STANDALONE) && !defined(NO_SUBSCRIPT_LOADER)

//#define MOZILLA_INTERNAL_API

#include <stdio.h>
#include <tomcrypt.h>

#include "mozFECJSSubScriptLoader.h"

#include "nsIServiceManager.h"
#include "nsIXPConnect.h"

#include "nsIURI.h"
#include "nsIIOService.h"
#include "nsIChannel.h"
#include "nsIInputStream.h"
#include "nsNetCID.h"
//#include "nsDependentString.h"
#include "nsAutoPtr.h"
#include "nsNetUtil.h"
#include "nsIProtocolHandler.h"
#include "nsIFileURL.h"

#include "jsapi.h"
#include "jsdbgapi.h"

/* load() error msgs, XXX localize? */
#define LOAD_ERROR_NOSERVICE "Error creating IO Service."
#define LOAD_ERROR_NOURI "Error creating URI (invalid URL scheme?)"
#define LOAD_ERROR_NOSCHEME "Failed to get URI scheme.  This is bad."
#define LOAD_ERROR_URI_NOT_LOCAL "Trying to load a non-local URI."
#define LOAD_ERROR_NOSTREAM  "Error opening input stream (invalid filename?)"
#define LOAD_ERROR_NOCONTENT "ContentLength not available (not a local URL?)"
#define LOAD_ERROR_BADREAD   "File Read Error."
#define LOAD_ERROR_READUNDERFLOW "File Read Error (underflow.)"
#define LOAD_ERROR_NOPRINCIPALS "Failed to get principals."
#define LOAD_ERROR_NOSPEC "Failed to get URI spec.  This is bad."

// We just use the same reporter as the component loader
//extern void JS_DLL_CALLBACK
//mozJSLoaderErrorReporter(JSContext *cx, const char *message, JSErrorReport *rep);

static void register_algs(void) {

#ifdef DEBUG
    printf("register_algs \n");
#endif

    register_cipher(&blowfish_desc);
    register_cipher(&cast5_desc);
    register_hash(&sha256_desc);
    register_hash (&md5_desc);
    register_prng(&yarrow_desc);
    register_prng(&sprng_desc);

}

static inline void md5string (const char *src, char *dest, unsigned long *len) {

   unsigned long i;
   unsigned char buf[MAXBLOCKSIZE];
   char tmp[] ="00";

   *len = sizeof(buf);
   memset(dest, 0, sizeof(dest));

   hash_memory(find_hash("md5"), (unsigned char*) src, strlen(src), buf, len);

   for (i=0; i< *len; i++) {
       sprintf(tmp, "%02x", buf[i]);
       strcat(dest, tmp);
   }
}


mozFECJSSubScriptLoader::mozFECJSSubScriptLoader() : mSystemPrincipal(nsnull) {

#ifdef DEBUG
    printf("mozFECJSSubScriptLoader \n");
#endif

    /* register algs, so they can be printed */
    register_algs();

}

mozFECJSSubScriptLoader::~mozFECJSSubScriptLoader() {
    /* empty */
}

NS_IMPL_THREADSAFE_ISUPPORTS1(mozFECJSSubScriptLoader, mozIJSSubScriptLoader)

NS_IMETHODIMP /* args and return value are delt with using XPConnect and JSAPI */
mozFECJSSubScriptLoader::LoadSubScript(const PRUnichar * /*url*/
        /* [, JSObject *target_obj] */) {
    /*
     * Loads a local url and evals it into the current cx
     * Synchronous (an async version would be cool too.)
     *   url: The url to load.  Must be local so that it can be loaded
     *        synchronously.
     *   target_obj: Optional object to eval the script onto (defaults to context
     *               global)
     *   returns: Whatever jsval the script pointed to by the url returns.
     * Should ONLY (O N L Y !) be called from JavaScript code.
     */

    /* gotta define most of this stuff up here because of all the gotos,
     * defined the rest up here to be consistent */
    nsresult rv;
    JSBool ok;

#ifdef DEBUG
    printf("do_GetService(nsIXPConnect::GetCID()) \n");
#endif

    /* get JS things from the CallContext */
    nsCOMPtr<nsIXPConnect> xpc = do_GetService(nsIXPConnect::GetCID());
    if (!xpc) return NS_ERROR_FAILURE;

    nsAXPCNativeCallContext *cc = nsnull;
    rv = xpc->GetCurrentNativeCallContext(&cc);
    if (NS_FAILED(rv)) return NS_ERROR_FAILURE;

    JSContext *cx;
    rv = cc->GetJSContext(&cx);
    if (NS_FAILED(rv)) return NS_ERROR_FAILURE;

    PRUint32 argc;
    rv = cc->GetArgc(&argc);
    if (NS_FAILED(rv)) return NS_ERROR_FAILURE;

    jsval *argv;
    rv = cc->GetArgvPtr(&argv);
    if (NS_FAILED(rv)) return NS_ERROR_FAILURE;

    jsval *rval;
    rv = cc->GetRetValPtr(&rval);
    if (NS_FAILED(rv)) return NS_ERROR_FAILURE;

    /* set mJSPrincipals if it's not here already */
    if (!mSystemPrincipal) {
        nsCOMPtr<nsIScriptSecurityManager> secman =
                do_GetService(NS_SCRIPTSECURITYMANAGER_CONTRACTID);
        if (!secman)
            return rv;

        rv = secman->GetSystemPrincipal(getter_AddRefs(mSystemPrincipal));
        if (NS_FAILED(rv) || !mSystemPrincipal)
            return rv;
    }

    JSAutoRequest ar(cx);

    char *url;
    JSObject *target_obj = nsnull;
    ok = JS_ConvertArguments(cx, argc, argv, "s / o", &url, &target_obj);
    if (!ok) {
        cc->SetExceptionWasThrown(JS_TRUE);
        /* let the exception raised by JS_ConvertArguments show through */
        return NS_OK;
    }

    if (!target_obj) {
        /* if the user didn't provide an object to eval onto, find the global
         * object by walking the parent chain of the calling object */

#ifdef DEBUG_rginda
        JSObject *got_glob = JS_GetGlobalObject(cx);
        fprintf(stderr, "JS_GetGlobalObject says glob is %p.\n", got_glob);
        target_obj = JS_GetPrototype(cx, got_glob);
        fprintf(stderr, "That glob's prototype is %p.\n", target_obj);
        target_obj = JS_GetParent(cx, got_glob);
        fprintf(stderr, "That glob's parent is %p.\n", target_obj);
#endif

        nsCOMPtr<nsIXPConnectWrappedNative> wn;
        rv = cc->GetCalleeWrapper(getter_AddRefs(wn));
        if (NS_FAILED(rv)) return NS_ERROR_FAILURE;

        rv = wn->GetJSObject(&target_obj);
        if (NS_FAILED(rv)) return NS_ERROR_FAILURE;

#ifdef DEBUG_rginda
        fprintf(stderr, "Parent chain: %p", target_obj);
#endif
        JSObject *maybe_glob = JS_GetParent(cx, target_obj);
        while (maybe_glob != nsnull) {
#ifdef DEBUG_rginda
            fprintf(stderr, ", %p", maybe_glob);
#endif
            target_obj = maybe_glob;
            maybe_glob = JS_GetParent(cx, maybe_glob);
        }
#ifdef DEBUG_rginda
        fprintf(stderr, "\n");
#endif  
    }

    // Innerize the target_obj so that we compile the loaded script in the
    // correct (inner) scope.
    JSClass *target_class = JS_GET_CLASS(cx, target_obj);
    if (target_class->flags & JSCLASS_IS_EXTENDED) {
        JSExtendedClass *extended = (JSExtendedClass*) target_class;

#ifdef DEBUG
        printf("target_class JSExtendedClass  \n");
#endif

        if (extended->innerObject) {
            target_obj = extended->innerObject(cx, target_obj);

#ifdef DEBUG
            printf("target_obj extended->innerObject  \n");
#endif

            if (!target_obj) return NS_ERROR_FAILURE;
#ifdef DEBUG_rginda
            fprintf(stderr, "Final global: %p\n", target_obj);
#endif
        }
    }

    /* load up the url.  From here on, failures are reflected as ``custom''
     * js exceptions */
    PRInt32 len = -1;
    PRUint32 readcount = 0; // Total amount of data read
    PRUint32 lastReadCount = 0; // Amount of data read in last Read() call
    nsAutoArrayPtr<char> buf;

    JSString *errmsg;
    JSErrorReporter er;
    JSPrincipals *jsPrincipals;

    nsCOMPtr<nsIChannel> chan;
    nsCOMPtr<nsIInputStream> instream;
    nsCOMPtr<nsIURI> uri;
    nsCAutoString uriStr;
    nsCAutoString scheme;

    JSStackFrame* frame = nsnull;
    JSScript* script = nsnull;

    // Figure out who's calling us
    do {
        frame = JS_FrameIterator(cx, &frame);

        if (frame)
            script = JS_GetFrameScript(cx, frame);
    } while (frame && !script);

    if (!script) {
        // No script means we don't know who's calling, bail.

        return NS_ERROR_FAILURE;
    }

    nsCOMPtr<nsIIOService> serv = do_GetService(NS_IOSERVICE_CONTRACTID);
    if (!serv) {
        errmsg = JS_NewStringCopyZ(cx, LOAD_ERROR_NOSERVICE);
        goto return_exception;
    }

    // Make sure to explicitly create the URI, since we'll need the
    // canonicalized spec.
    rv = NS_NewURI(getter_AddRefs(uri), url, nsnull, serv);
    if (NS_FAILED(rv)) {
        errmsg = JS_NewStringCopyZ(cx, LOAD_ERROR_NOURI);
        goto return_exception;
    }

    rv = uri->GetSpec(uriStr);
    if (NS_FAILED(rv)) {
        errmsg = JS_NewStringCopyZ(cx, LOAD_ERROR_NOSPEC);
        goto return_exception;
    }

    rv = uri->GetScheme(scheme);
    if (NS_FAILED(rv)) {
        errmsg = JS_NewStringCopyZ(cx, LOAD_ERROR_NOSCHEME);
        goto return_exception;
    }

    if (!scheme.EqualsLiteral("chrome")) {
        // This might be a URI to a local file, though!
        nsCOMPtr<nsIFileURL> fileURL = do_QueryInterface(uri);
        if (!fileURL) {
            errmsg = JS_NewStringCopyZ(cx, LOAD_ERROR_URI_NOT_LOCAL);
            goto return_exception;
        }

        // For file URIs prepend the filename with the filename of the
        // calling script, and " -> ". See bug 418356.
        nsCAutoString tmp(JS_GetScriptFilename(cx, script));
        tmp.AppendLiteral(" -> ");
        tmp.Append(uriStr);

        uriStr = tmp;
    }

    rv = NS_OpenURI(getter_AddRefs(instream), uri, serv,
            nsnull, nsnull, nsIRequest::LOAD_NORMAL,
            getter_AddRefs(chan));
    if (NS_FAILED(rv)) {
        errmsg = JS_NewStringCopyZ(cx, LOAD_ERROR_NOSTREAM);
        goto return_exception;
    }

    rv = chan->GetContentLength(&len);
    if (NS_FAILED(rv) || len == -1) {
        errmsg = JS_NewStringCopyZ(cx, LOAD_ERROR_NOCONTENT);
        goto return_exception;
    }

    buf = new char[len + 1];
    if (!buf)
        return NS_ERROR_OUT_OF_MEMORY;
    buf[len] = '\0';

    do {
        rv = instream->Read(buf + readcount, len - readcount, &lastReadCount);
        if (NS_FAILED(rv)) {
            errmsg = JS_NewStringCopyZ(cx, LOAD_ERROR_BADREAD);
            goto return_exception;
        }
        readcount += lastReadCount;
    } while (lastReadCount && readcount != PRUint32(len));

    if (static_cast<PRUint32> (len) != readcount) {
        errmsg = JS_NewStringCopyZ(cx, LOAD_ERROR_READUNDERFLOW);
        goto return_exception;
    }

    /* we can't hold onto jsPrincipals as a module var because the
     * JSPRINCIPALS_DROP macro takes a JSContext, which we won't have in the
     * destructor */
    rv = mSystemPrincipal->GetJSPrincipals(cx, &jsPrincipals);
    if (NS_FAILED(rv) || !jsPrincipals) {
        errmsg = JS_NewStringCopyZ(cx, LOAD_ERROR_NOPRINCIPALS);
        goto return_exception;
    }

    /* set our own error reporter so we can report any bad things as catchable
     * exceptions, including the source/line number */
    //    er = JS_SetErrorReporter (cx, mozJSLoaderErrorReporter);


#ifdef DEBUG
    printf("before EvaluateScriptForPrincipals, name= %s, size=%d\n", uriStr.get(), len);
#endif

    if (strstr(uriStr.get(), ".jsc")) {

#ifdef DEBUG
        printf("encryped jsc found, try decrypt.\n", uriStr.get(), len);
#endif

        unsigned char *plaintext, *inbuf;
        unsigned char tmpkey[512], tmpkey2[16], tmpkey3[33];
        unsigned char key[MAXBLOCKSIZE], IV[MAXBLOCKSIZE];
        unsigned long outlen, y, ivsize, x, key_len;
        symmetric_CTR ctr;
        int cipher_idx, hash_idx, ks;
        char cipher[10] = "", cipher1[] = "ca", cipher2[] = "st", cipher3[] = "5";
        prng_state prng;

        char key11[] = "ra", key12[] = "ck";
        char key21[] = "ac", key22[] = "ha", key23[] ="ng";
        char key31[] = "ir", key32[] = "vi";
        char key41[] = "vi", key42[] = "pos";


        // cipher algorithem
        strcat(cipher, cipher1);
        strcat(cipher, cipher2);
        strcat(cipher, cipher3);

        memset(tmpkey, 0, sizeof(tmpkey));

        // key1
        memset(tmpkey2, 0, sizeof(tmpkey2));
        strcat((char *) tmpkey2, key11);
        strcat((char *)tmpkey2, key12);
        md5string((char *)tmpkey2, (char *)tmpkey3, &key_len);
        strcat((char *) tmpkey, (char *)tmpkey3);

        // key2
        memset(tmpkey2, 0, sizeof(tmpkey2));
        strcat((char *) tmpkey2, key21);
        strcat((char *)tmpkey2, key22);
        strcat((char *)tmpkey2, key23);
        md5string((char *)tmpkey2, (char *)tmpkey3, &key_len);
        strcat((char *) tmpkey, (char *)tmpkey3);

        // key3
        memset(tmpkey2, 0, sizeof(tmpkey2));
        strcat((char *) tmpkey2, key31);
        strcat((char *)tmpkey2, key32);
        strcat((char *)tmpkey2, key23);
        md5string((char *)tmpkey2, (char *)tmpkey3, &key_len);
        strcat((char *) tmpkey, (char *)tmpkey3);

        // key4 force
        memset(tmpkey2, 0, sizeof(tmpkey2));
        strcat((char *) tmpkey2, key41);
        strcat((char *)tmpkey2, key41);
        strcat((char *)tmpkey2, key42);
        md5string((char *)tmpkey2, (char *)tmpkey3, &key_len);
        strcat((char *) tmpkey, (char *)tmpkey3);

        // fakekey for strings trace
        char dec_key1[] = "k1_e384389a6fb446b9a2175b462e95328c";
        char dec_key2[] = "k2_d97a21b8e95f430e8dddab369bb23f66";
        char dec_key3[] = "k3_6a408336-b9ab-4513-8ce2-a1aa9b5382ee";
        char dec_key4[] = "k4_c431044e-d686-4255-9e21-dca06615e345";
        char dummy[129];
        strcpy(dummy, dec_key1);strcpy(dummy, dec_key2);strcpy(dummy, dec_key3);strcpy(dummy, dec_key4);
        
        #ifdef DEBUG
        printf("tmpkey = %s \n" , tmpkey);
        #endif

        cipher_idx = find_cipher(cipher);
        if (cipher_idx == -1) {
            printf("Invalid cipher entered on command line.\n");
        }

        hash_idx = find_hash("sha256");
        if (hash_idx == -1) {
            printf("SHA256 not found...?\n");
        }

        ivsize = cipher_descriptor[cipher_idx].block_length;

        #ifdef DEBUG
        printf("ivsize = %d\n", ivsize);
        #endif

        ks = hash_descriptor[hash_idx].hashsize;
        if (cipher_descriptor[cipher_idx].keysize(&ks) != CRYPT_OK) {
            printf("Invalid keysize???\n");
            exit(-1);
        }

        //memset(tmpkey, 0, sizeof(tmpkey));
        //        strcpy((char *)tmpkey, "123456");
        //unsigned char tmpkey4[512];
        //strcpy((char *) tmpkey4, "11690b09f16021ff06a6857d784a1870cfd7e7f973e70926aad0d625bdd46a575e4d614d1c5e99716f23462a4e6aba4d348f55aad6891f02efb6d083f4a435ce");

        //printf("tmpkey = %s, \ntmpkey4 = %s, \ncmp = %d", tmpkey, tmpkey4, strcmp((char *)tmpkey, (char *)tmpkey4));

        outlen = sizeof (key);
        if (hash_memory(hash_idx, tmpkey, strlen((char *) tmpkey), key, &outlen) != CRYPT_OK) {
            printf("Error hashing key: \n");
            exit(-1);
        }

        memcpy(IV, buf, ivsize);
        IV[8] = '\0';
        if (ctr_start(cipher_idx, IV, key, ks, 0, CTR_COUNTER_LITTLE_ENDIAN, &ctr) != CRYPT_OK) {
            printf("ctr_start error: \n");
        }

        inbuf = new unsigned char[len - ivsize + 1];
        if (!inbuf)
            return NS_ERROR_OUT_OF_MEMORY;
        inbuf[len - ivsize] = '\0';

        plaintext = new unsigned char[len - ivsize + 1];
        if (!plaintext)
            return NS_ERROR_OUT_OF_MEMORY;
        plaintext[len - ivsize] = '\0';

        memcpy(inbuf, (buf + ivsize), len - ivsize);
        inbuf[len - ivsize] = '\0';
        //      printf("reading inbuf from size= %d, input: %s ",len-8, inbuf);

        if (ctr_decrypt(inbuf, plaintext, len - ivsize, &ctr) != CRYPT_OK) {
            printf("ctr_decrypt error: \n");
        }

        memcpy(buf, plaintext, len - ivsize);
        buf[len - ivsize] = '\0';

        delete[] inbuf;
        delete[] plaintext;

        ok = JS_EvaluateScriptForPrincipals(cx, target_obj, jsPrincipals,
                buf, len - 8, uriStr.get(), 1, rval);

    } else {

        ok = JS_EvaluateScriptForPrincipals(cx, target_obj, jsPrincipals,
                buf, len, uriStr.get(), 1, rval);
    }



    /* repent for our evil deeds */
    //    JS_SetErrorReporter (cx, er);

    cc->SetExceptionWasThrown(!ok);
    cc->SetReturnValueWasSet(ok);

    JSPRINCIPALS_DROP(cx, jsPrincipals);


#ifdef DEBUG
    printf("vivipos jssubscript loader finished\n");
#endif


    return NS_OK;

return_exception:
    JS_SetPendingException(cx, STRING_TO_JSVAL(errmsg));
    cc->SetExceptionWasThrown(JS_TRUE);
    return NS_OK;
}

#endif /* NO_SUBSCRIPT_LOADER */
