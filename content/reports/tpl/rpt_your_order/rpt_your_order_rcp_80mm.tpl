[&INIT]
[&QSON]${head.store.name|center:21}[&QSOFF]
[&DWON]${head.store.branch|center:21}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no|left:10} Clerk: ${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${_('(rpt)Condition') + ' - '}
${queryFormLabel.terminal_no_label}${queryFormLabel.terminal_no}
${queryFormLabel.shift_no_label}${queryFormLabel.shift_no}
${queryFormLabel.period_type_label}${queryFormLabel.period_type}
${queryFormLabel.status_label}${queryFormLabel.status}
${queryFormLabel.destination_label}${queryFormLabel.destination}
${queryFormLabel.sortby_label}${queryFormLabel.sortby}
${queryFormLabel.database_label}${queryFormLabel.database}

${head.title|center:42}
------------------------------------------
{for detail in body}
{eval}
  TrimPath.RoundingPrices = detail.rounding_prices;
  TrimPath.PrecisionPrices = detail.precision_prices;
  TrimPath.RoundingTaxes = detail.rounding_taxes;
  TrimPath.PrecisionTaxes = detail.precision_taxes;
{/eval}
{for field in fields}
${_( field.name ) + ': '|left:20}{if field.datatype == "time"}
${detail[ field.value ]|unixTimeToString|right:22}
{elseif field.datatype == "date"}${detail[ field.value ]|unixTimeToLocale:'date'|right:22}
{elseif field.datatype == "dollar"}${detail[ field.value ]|default:0|viviFormatPrices:true|right:22}
{elseif field.datatype == "number"}${detail[ field.value ]|right:22}
{elseif field.datatype == "counter"}${detail[ field.value ]|default:0|right:22}
{else}${detail[ field.value ]|right:22}
{/if}
{/for}
------------------------------------------
{/for}
{eval}
  delete TrimPath.RoundingPrices;
  delete TrimPath.PrecisionPrices;
  delete TrimPath.RoundingTaxes;
  delete TrimPath.PrecisionTaxes;
{/eval}
${_( '(rpt)Records Found' ) + ': '|left:30}${foot.foot_datas.rowCount|default:0|format:0|right:12}
${_( '(rpt)Records Displayed' ) + ':'|left:30}${body.length|default:0|format:0|right:12}
------------------------------------------
${_( '(rpt)Summary' )}
{for field in fields}
{if foot.foot_datas[ field.value ] != null}
${'    ' + _( '(rpt)' + field.name ) + ': '|left:20}{if field.datatype == "time"}
${foot.foot_datas[ field.value ]|unixTimeToString|right:22}
{elseif field.datatype == "date"}${foot.foot_datas[ field.value ]|unixTimeToLocale:'date'|right:22}
{elseif field.datatype == "dollar"}${foot.foot_datas[ field.value ]|default:0|viviFormatPrices:true|right:22}
{elseif field.datatype == "number"}${foot.foot_datas[ field.value ]|right:22}
{elseif field.datatype == "counter"}${foot.foot_datas[ field.value ]|default:0|right:22}
{else}${foot.foot_datas[ field.value ]|right:22}
{/if}
{/if}
{/for}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
