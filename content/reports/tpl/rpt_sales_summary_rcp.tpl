[&QSON]${head.store.name|center:21}[&QSOFF]
[&DWON]${head.store.branch|center:21}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no|left:10} Clerk: ${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}
------------------------------------------
Sales Summary
  Orders:        ${body.sales_summary.OrderNum|default:0|viviFormatPrices:true}
  Total:         ${body.sales_summary.Total|default:0|viviFormatPrices:true}
  Guests:        ${body.sales_summary.Guests|default:0|viviFormatPrices:true}
  Items:         ${body.sales_summary.ItemsCount|default:0|viviFormatPrices:true}
  Average Total: ${body.sales_summary.AvgTotal|default:0|viviFormatPrices:true}
  Average Guest: ${body.sales_summary.AvgGuests|default:0|viviFormatPrices:true}
  Average Items: ${body.sales_summary.AvgItemsCount|default:0|viviFormatPrices:true}
------------------------------------------
Payment List
  Payment                   Total
  ------------------------  --------------
{for detail in body.payment_list}
  ${detail.payment_name|left:24}  ${detail.total|default:0|viviFormatPrices:true}
{/for}
------------------------------------------
Destination Summary
  IN Num:   0
  IN Amt:   0
  OUT Num:  0
  OUT Amt:  0
  SENT Num: 0
  SENT Amt: 0
------------------------------------------
Department Sales Billboard
  Department          Qty     Total
  ------------------  ------  ------------
{for detail in body.dept_sales}
  ${detail.cate_no|left:18}  ${detail.qty|right:6}  ${detail.total|default:0|viviFormatPrices:true}
{/for}
------------------------------------------
Product Sales Billboard
  Product             Qty     Total
  ------------------  ------  ------------
{for detail in body.prod_sales}
  ${detail.product_name|left:18}  ${detail.qty|right:6}  ${detail.total|default:0|viviFormatPrices:true}
{/for}
------------------------------------------
Hourly Sales
  Time          Guests Orders Total
  ------------- ------ ------ ------------
{for detail in body.hourly_sales}
  ${detail.Hour|left:13} ${detail.Guests|right:6} ${detail.OrderNum|right:6} ${detail.HourTotal|default:0|viviFormatPrices:true}
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