[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
機檯: ${head.store.terminal_no|left:10} 櫃員: ${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
{for master in body}
==========================================
營業日      起始時間        結束時間
----------  --------------  --------------
${master.sale_period|right:10}  ${master.starttime|right:14}  ${master.endtime|right:14}
------------------------------------------
機器時間   :${master.terminal_no|right:30}
班別       :${master.shift_number|right:30}
總金額     :${master.balance|default:0|viviFormatPrices:true|right:30}
現金淨額   :${master.cash|default:0|viviFormatPrices:true|right:30}
銷售金額   :${master.sales|default:0|viviFormatPrices:true|right:30}
溢收金額   :${master.excess|default:0|viviFormatPrices:true|right:30}
代收金額   :${master.ledger_in|default:0|viviFormatPrices:true|right:30}
代付金額   :${master.ledger_out|default:0|viviFormatPrices:true|right:30}
------------------------------------------
會計科目                 金額         筆數
------------------- ------------- --------
{eval}
  destDetails = [];
{/eval}
{for detail in master.ShiftChangeDetail}
{if detail.type == 'destination'}
{eval}
  destDetails.push(detail);
{/eval}
{else}
{if detail.name.length > 0}${detail.name|left:19}{else}${detail.type|left:19}{/if}
 ${detail.amount|default:0|viviFormatPrices:true|right:13} ${detail.count|default:0|right:8}
{/if}
{/for}
{if destDetails.length > 0}
------------------------------------------
目的地                   金額         筆數
------------------- ------------- --------
{for dest in destDetails}
${dest.name|left:19} ${dest.amount|default:0|viviFormatPrices:true|right:13} ${dest.count|default:0|right:8}
{/for}
{/if}
{/for}
==========================================
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
