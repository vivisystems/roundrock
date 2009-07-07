[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}
${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${head.title|center:24}
{for detail in body}
{eval}
  TrimPath.RoundingPrices = detail.rounding_prices;
  TrimPath.PrecisionPrices = detail.precision_prices;
  TrimPath.RoundingTaxes = detail.rounding_taxes;
  TrimPath.PrecisionTaxes = detail.precision_taxes;
{/eval}
------------------------
{for field in fields}
${_( field.name ) + ':'}
{if field.datatype == "time"}
${detail[ field.value ]|unixTimeToString|right:24}
{elseif field.datatype == "date"}
${detail[ field.value ]|unixTimeToLocale:'date'|right:24}
{elseif field.datatype == "dollar"}
${detail[ field.value ]|default:0|viviFormatPrices:true|right:24}
{elseif field.datatype == "number"}
${detail[ field.value ]|right:24}
{elseif field.datatype == "counter"}
${detail[ field.value ]|default:0|right:24}
{else}
${detail[ field.value ]|right:24}
{/if}
{/for}
{/for}
{eval}
  delete TrimPath.RoundingPrices;
  delete TrimPath.PrecisionPrices;
  delete TrimPath.RoundingTaxes;
  delete TrimPath.PrecisionTaxes;
{/eval}
------------------------
${_( '(rpt)Records Found' ) + ': '|left:16}${body.length|default:0|format:0|right:8}
[&CR]
------------------------
${_( '(rpt)Summary' )}
{for field in fields}
{if foot.foot_datas[ field.value ] != null}
${_( '(rpt)' + field.name ) + ':'}
{if field.datatype == "time"}
${foot.foot_datas[ field.value ]|unixTimeToString|right:24}
{elseif field.datatype == "date"}
${foot.foot_datas[ field.value ]|unixTimeToLocale:'date'|right:24}
{elseif field.datatype == "dollar"}
${foot.foot_datas[ field.value ]|default:0|viviFormatPrices:true|right:24}
{elseif field.datatype == "number"}
${foot.foot_datas[ field.value ]|right:24}
{elseif field.datatype == "counter"}
${foot.foot_datas[ field.value ]|default:0|right:24}
{else}
${foot.foot_datas[ field.value ]|right:24}
{/if}
{/if}
{/for}
------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
