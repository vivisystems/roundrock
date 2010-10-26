"${head.title}"

"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telephone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"
"${_( '(rpt)Start Time' ) + ':'}","${head.start_time}"
"${_( '(rpt)End Time' ) + ':'}","${head.end_time}"
"${_('(rpt)Condition') + ' - '}"
"${queryFormLabel.terminal_no_label}","${queryFormLabel.terminal_no}"
"${queryFormLabel.shift_no_label}","${queryFormLabel.shift_no}"
"${queryFormLabel.period_type_label}","${queryFormLabel.period_type}"
"${queryFormLabel.status_label}","${queryFormLabel.status}"
"${queryFormLabel.destination_label}","${queryFormLabel.destination}"
"${queryFormLabel.sortby_label}","${queryFormLabel.sortby}"
"${queryFormLabel.database_label}","${queryFormLabel.database}"

{for field in fields}"${_( field.name )}",{/for}""
{for detail in body}
{eval}
  TrimPath.RoundingPrices = detail.rounding_prices;
  TrimPath.PrecisionPrices = detail.precision_prices;
  TrimPath.RoundingTaxes = detail.rounding_taxes;
  TrimPath.PrecisionTaxes = detail.precision_taxes;
{/eval}
{for field in fields}{if field.datatype == "time"}"${detail[ field.value ]|unixTimeToString}",{elseif field.datatype == "date"}"${detail[ field.value ]|unixTimeToLocale:'date'}",{elseif field.datatype == "dollar"}"${detail[ field.value ]|default:0|viviFormatPrices:true}",{elseif field.datatype == "number"}"${detail[ field.value ]}",{elseif field.datatype == "counter"}"${detail[ field.value ]|default:0}",{else}"${detail[ field.value ]}",{/if}{/for}""
{/for}
{eval}
  delete TrimPath.RoundingPrices;
  delete TrimPath.PrecisionPrices;
  delete TrimPath.RoundingTaxes;
  delete TrimPath.PrecisionTaxes;
{/eval}
"${_( '(rpt)Records Found' ) }:","${body.length|default:0|format:0}","${_( '(rpt)Summary' ) + ':'}"
{for field in fields}{if field.datatype == "time"}"${foot.foot_datas[ field.value ]|unixTimeToString}",{elseif field.datatype == "date"}"${foot.foot_datas[ field.value ]|unixTimeToLocale:'date'}",{elseif field.datatype == "dollar"}"${foot.foot_datas[ field.value ]|default:0|viviFormatPrices:true}",{elseif field.datatype == "number"}"${foot.foot_datas[ field.value ]}",{elseif field.datatype == "counter"}"${foot.foot_datas[ field.value ]|default:0}",{else}"${foot.foot_datas[ field.value ]}",{/if}{/for}""
