/* 
 * File:   mozFecAosd.h
 * Author: rack
 *
 * Created on 2008年12月13日, 下午 2:22
 */

#ifndef _MOZFECNOTIFY_H
#define	_MOZFECNOTIFY_H

#include "mozIFECNotify.h"

// 53cf7763-0bd8-48a3-bd00-2ebf014ab385
#define MOZ_FECNOTIFY_CID \
{ 0x53cf7763, 0x0bd8, 0x48a3, \
  { 0xbd, 0x00, 0x2e, 0xbf, 0x01, 0x4a, 0xb3, 0x85 } }

#define MOZ_FECNOTIFY_CONSTRACT_ID "@firich.com.tw/notify;1"


class mozFECNotify : public mozIFECNotify
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_MOZIFECNOTIFY

  mozFECNotify();

private:
  int isNotifyInit;
  ~mozFECNotify();

protected:
  /* additional members */
};


#endif	/* _MOZFECNOTIFY_H */

