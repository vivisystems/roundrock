        <table>
            <tbody>
        {if duplicate}
                <tr>
                    <td class="header3">${'Bill Copy'}</p>
                </tr>
        {/if}
                <tr>
                    <td colspan="2" class="header1">${store.name}</td>
                </tr>
                <tr>
                    <td colspan="2" class="header2">${store.branch}</td>
                </tr>
                <tr>
                    <td colspan="2">${store.telephone1}</td>
                </tr>
                <tr>
                    <td colspan="2">${(new Date()).toLocaleFormat('%Y-%m-%d %H:%M:%S')}</td>
                </tr>
                <tr>
                    <td colspan="2">${'Terminal:&nbsp;'} ${order.terminal_no}</td>
                </tr>
                <tr>
                    <td colspan="2">${'Clerk:&nbsp;'} ${order.proceeds_clerk_displayname}<br /></td>
                </tr>
                <tr>
                    <td colspan="2"><hr /></td>
                </tr>
        {for item in order.items_summary}
                <tr>
                    <td colspan="2">${item.qty_subtotal|right:3} X ${item.name|left:18}</td>
                </tr>
                <tr>
                    <td colspan="2" class="right">${item.subtotal|viviFormatPrices:true}</td>
                </tr>
        {if item.discount_subtotal != 0}
                <tr>
                    <td colspan="2" class="right">${item.discount_subtotal|viviFormatPrices:true}</td>
                </tr>
        {/if}
        {if item.surcharge_subtotal != 0}
                <tr>
                    <td colspan="2" class="right">${'+' + item.surcharge_subtotal|viviFormatPrices:true}</td>
                </tr>
        {/if}
        {/for}
                <tr>
                    <td colspan="2"><hr /></td>
                </tr>
        {if order.trans_discount_subtotal != 0}
                <tr>
                    <td>${'Order Discount:'}</td>
                    <td class="right">${order.trans_discount_subtotal|viviFormatPrices:true}</td>
                </tr>
        {/if}
        {if order.trans_surcharge_subtotal != 0}
                <tr>
                    <td>${'Order Surcharge:'}</td>
                    <td class="right">${order.trans_surcharge_subtotal|viviFormatPrices:true}</td>
                </tr>
        {/if}
        {if order.revalue_subtotal != 0}
                <tr>
                    <td>${'Order Revalue:'}</td>
                    <td class="right">${order.revalue_subtotal|viviFormatPrices:true}</td>
                </tr>
        {/if}
        {if order.promotion_subtotal != 0}
                <tr>
                    <td>${'Promotion:'}</td>
                    <td class="right">${order.promotion_subtotal|viviFormatPrices:true}</td>
                </tr>
        {/if}
                <tr>
                    <td>${'Tax:'}</td>
                    <td class="right">${order.tax_subtotal|viviFormatTaxes:true}</td>
                </tr>
                <tr>
                    <td>${'Total:'}</td>
                    <td class="right">${order.total|viviFormatPrices:true}</td>
                </tr>
                <tr><td>&nbsp;</td></tr>
                <tr>
                    <td>${'Received:'}</td>
                    <td class="right">${order.payment_subtotal|viviFormatPrices:true}</td>
                </tr>
        {if order.remain > 0}
                <tr>
                    <td>${'BALANCE:'}</td>
                    <td class="right">${order.remain|viviFormatPrices:true}</td>
                </tr>
        {else}
                <tr>
                    <td>${'CHANGE:'}</td>
                    <td class="right">${(0 - order.remain)|viviFormatPrices:true}</td>
                </tr>
        {/if}
                <tr>
                    <td colspan="2"><hr /></td>
                </tr>
                <tr><td>&nbsp;</td></tr>
                <tr>
                    <td colspan="2">${'Thank you for shopping at'}</td>
                </tr>
                <tr>
                    <td colspan="2" class="header2">${store.name}</td>
                </tr>
            </tbody>
        </table>