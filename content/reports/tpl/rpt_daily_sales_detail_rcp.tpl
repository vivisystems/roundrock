[&QSON]${head.store.name|center:21}[&QSOFF]
[&DWON]${head.store.branch|center:21}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no|left:10} Clerk: ${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}
{for detail in body}
------------------------------------------
Term_No. Time Sequence Total Guests Items
-------- ---- -------- ----- ------ ------
${detail.terminal_no} ${detail.Order.Time} ${detail.sequence} ${detail.total} ${detail.no_of_customers} ${detail.items_count}
------------------------------------------
{for items in detail.OrderItem}
${items.product_no} ${items.product_name} ${items.current_price} ${items.current_qty} ${items.current_subtotal}
{/for}
{/for}
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]