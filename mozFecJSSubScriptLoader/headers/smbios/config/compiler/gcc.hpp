//  (C) Copyright John Maddock 2001 - 2003. 
//  (C) Copyright Darin Adler 2001 - 2002. 
//  (C) Copyright Jens Maurer 2001 - 2002. 
//  (C) Copyright Beman Dawes 2001 - 2003. 
//  (C) Copyright Douglas Gregor 2002. 
//  (C) Copyright David Abrahams 2002 - 2003. 
//  (C) Copyright Synge Todo 2003. 
//  Use, modification and distribution are subject to the 
//  Boost Software License, Version 1.0. (See accompanying file 
//  LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//  See http://www.boost.org for most recent version.

//  GNU C++ compiler setup:

#   if __GNUC__ == 2 && __GNUC_MINOR__ == 91
       // egcs 1.1 won't parse shared_ptr.hpp without this:
#      define LIBSMBIOS_NO_AUTO_PTR
#   endif
#   if __GNUC__ == 2 && __GNUC_MINOR__ < 95
      //
      // Prior to gcc 2.95 member templates only partly
      // work - define LIBSMBIOS_MSVC6_MEMBER_TEMPLATES
      // instead since inline member templates mostly work.
      //
#     define LIBSMBIOS_NO_MEMBER_TEMPLATES
#     if __GNUC_MINOR__ >= 9
#       define LIBSMBIOS_MSVC6_MEMBER_TEMPLATES
#     endif
#   endif

#   if __GNUC__ == 2 && __GNUC_MINOR__ < 96
#     define LIBSMBIOS_NO_SFINAE
#   endif

#   if __GNUC__ == 2 && __GNUC_MINOR__ <= 97
#     define LIBSMBIOS_NO_MEMBER_TEMPLATE_FRIENDS
#     define LIBSMBIOS_NO_OPERATORS_IN_NAMESPACE
#   endif

#   if __GNUC__ < 3
#      define LIBSMBIOS_NO_USING_DECLARATION_OVERLOADS_FROM_TYPENAME_BASE
#      define LIBSMBIOS_FUNCTION_SCOPE_USING_DECLARATION_BREAKS_ADL
#   endif

#ifndef __EXCEPTIONS
# define LIBSMBIOS_NO_EXCEPTIONS
#endif

// GCC has __PRETTY_FUNCTION__ macro
#define LIBSMBIOS_HAS_PRETTY_FUNCTION
#define LIBSMBIOS_HAS_FUNCTION

//
// Bug specific to gcc 3.1 and 3.2:
//
#if (__GNUC__ == 3) && ((__GNUC_MINOR__ == 1) || (__GNUC_MINOR__ == 2))
#  define LIBSMBIOS_NO_EXPLICIT_FUNCTION_TEMPLATE_ARGUMENTS
#endif

#define LIBSMBIOS_PACKED_ATTR      __attribute__ ((packed))
#define UNREFERENCED_PARAMETER(P)  (void)(P)

//
// Threading support: Turn this on unconditionally here (except for
// those platforms where we can know for sure). It will get turned off again
// later if no threading API is detected.
//
#if !defined(__MINGW32__) && !defined(linux) && !defined(__linux) && !defined(__linux__)
# define LIBSMBIOS_HAS_THREADS
#endif 

//
// gcc has "long long"
//
#define LIBSMBIOS_HAS_LONG_LONG

//
// gcc implements the named return value optimization since version 3.1
//
#if __GNUC__ > 3 || ( __GNUC__ == 3 && __GNUC_MINOR__ >= 1 )
#define LIBSMBIOS_HAS_NRVO
#endif

#define LIBSMBIOS_COMPILER "GNU C++ version " __VERSION__

//
// versions check:
// we don't know gcc prior to version 2.90:
#if (__GNUC__ == 2) && (__GNUC_MINOR__ < 90)
#  error "Compiler not configured - please reconfigure"
#endif
//
// last known and checked version is 3.4:
#if (__GNUC__ > 4) || ((__GNUC__ == 4) && (__GNUC_MINOR__ > 3))
#  if defined(LIBSMBIOS_ASSERT_CONFIG)
#     error "Unknown compiler version - please run the configure tests and report the results"
#  else
#     warning "Unknown compiler version - please run the configure tests and report the results"
#  endif
#endif


