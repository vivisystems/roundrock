<!-- div class="paper" style="overflow:auto;" -->
<div id="printhead">
<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
</div>
<div id="docbody" class="paper">
<p align="left">${head.store.name}</p>
<p align="left">${head.store.branch}</p>
<p align="left">${head.store.telephone1}</p>
<p align="left">${_( 'Terminal' ) + ': '}${head.store.terminal_no}</p>
<p align="left">${_( 'Clerk' ) + ': '}${head.clerk_displayname}</p>
<p align="right">${_( 'Printed Time' ) + ': '}${foot.gen_time}</p>
<p align="right">${head.start_time} - ${head.end_time}</p>

        <table id="body-table">
            <caption>${head.title}</caption>
            <thead>
                <tr>
                    <th style="text-align: left;">${_( 'Term_No.' )}</th>
                    <th style="text-align: left;">${_( 'Time' )}</th>
                    <th style="text-align: right;">${_( 'Total' )}</th>
                    <th style="text-align: right;">${_( 'Orders' )}</th>
                    <th style="text-align: right;">${_( 'Guests' )}</th>
                    <th style="text-align: right;">${_( 'Items' )}</th>
                </tr>
            </thead>
            <tbody>
{for detail in body}
                <tr>
                    <td style="text-align: left;">{if head.machine_id} ${detail.terminal_no} {/if}</td>
                    <td style="text-align: left;">${detail.Hour}</td>
                    <td style="text-align: right;">${detail.HourTotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.OrderNum}</td>
                    <td style="text-align: right;">${detail.Guests}</td>
                    <td style="text-align: right;">${detail.ItemsCount}</td>
                </tr>
{/for}
            </tbody>
            <tfoot>
                <tr>
                    <td></td>
                    <td>${_( 'Summary' ) + ':'}</td>
                    <td style="text-align: right;">${foot.HourTotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.OrderNum}</td>
                    <td style="text-align: right;">${foot.Guests}</td>
                    <td style="text-align: right;">${foot.ItemsCount}</td>
                </tr>
            </tfoot>
        </table>
        </br>

</div>
<!--/div -->
