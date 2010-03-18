<style>
    * {
        font-family: monospace;
    }
</style>
<div style="text-align: center; font-size: 20px; font-weight: bold;">${store.name}</div>
<div style="text-align: center; font-size: 16px; font-weight: bold;">${store.branch}</div>
<div style="text-align: center; font-size: 12px; font-weight: bold;">${store.telephone1}</div>
<hr/>
<table style="width: 100%">
    <tbody>
        <tr>
            <td style="text-align: left; font-size: 12px; font-weight: normal;">${_('(view)Terminal')}: ${order.terminal_no}</td>
            <td style="text-align: right; font-size: 12px; font-weight: normal;">${(new Date()).toLocaleFormat('%Y-%m-%d %H:%M:%S')}</td>
        </tr>
        <tr>
            <td colspan="2" style="font-family: courier; font-size: 12px; font-weight: normal;">${_('(view)Clerk')}: ${order.service_clerk_displayname}</td>
        </tr>
    </tbody>
</table>
<hr/>
<table style="width: 100%">
    <tbody>
{for item in order.items_summary}
        <tr>
            <td style="text-align: left; font-size: 12px; font-weight: normal;">${item.name}</td>
            <td style="text-align: center; font-size: 12px; font-weight: normal;">&nbsp;X&nbsp;</td>
            <td style="text-align: right; font-size: 12px; font-weight: normal;">${item.qty_subtotal}</td>
            <td style="text-align: right; font-size: 12px; font-weight: normal;">${item.subtotal|viviFormatPrices}</td>
        </tr>
{/for}
</table>
<hr/>
<table style="width: 100%">
    <tbody>
{if order.revalue_subtotal != 0}
        <tr>
            <td colspan="5" style="text-align: left; font-size: 12px; font-weight: normal;">${_('(view)Order Revalue')}:</td>
            <td style="text-align: right; font-size: 12px; font-weight: normal;">${order.revalue_subtotal|viviFormatPrices}</td>
        </tr>
        <tr>
            <td colspan="6"><hr/></td>
        </tr>
{/if}
        <tr>
            <td colspan="6" style="text-align: left; font-size: 12px; font-weight: normal;">${_('(view)Taxes')}:</td>
        </tr>
{for tax in order.items_tax_details}
        <tr>
            <td/>
            <td style="text-align: left; font-size: 12px; font-weight: normal;">${tax.tax.no}</td>
            <td style="text-align: right; font-size: 12px; font-weight: normal;">${tax.taxable_amount|viviFormatPrices}</td>
            <td style="text-align: right; font-size: 12px; font-weight: normal;">${tax.included_tax_subtotal|viviFormatTaxes}</td>
            <td style="text-align: right; font-size: 12px; font-weight: normal;">${tax.tax_subtotal|viviFormatTaxes}</td>
        </tr>
{/for}
        <tr>
            <td colspan="2" style="text-align: left; font-size: 12px; font-weight: normal;">${_('(view)Included Tax')}:</td>
            <td colspan="3"/>
            <td style="text-align: right; font-size: 12px; font-weight: normal;">${order.included_tax_subtotal|viviFormatTaxes}</td>
        </tr>
        <tr>
            <td colspan="2" style="text-align: left; font-size: 12px; font-weight: normal;">${_('(view)Addon Tax')}:</td>
            <td colspan="3"/>
            <td style="text-align: right; font-size: 12px; font-weight: normal;">${order.tax_subtotal|viviFormatTaxes}</td>
        </tr>
    </tbody>
</table>
</div>