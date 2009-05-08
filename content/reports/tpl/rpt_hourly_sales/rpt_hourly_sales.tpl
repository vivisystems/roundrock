<!---->
<div id="printhead">
	<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
</div>
<div id="docbody" class="paper">
	<p class="heading_store">${head.store.name} - ${head.store.branch}</p>
	<p class="heading_store">${head.store.telephone1}</p>

	<div style="float: left;">
		<p class="heading_p">${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}</p>
		<p class="heading_p">${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}</p>
		<p class="caption">${head.title}</p>
	</div>

	<div style="float: right;">
		<p class="heading_p">&nbsp;</p>
		<p class="heading_p" align="right">${_( '(rpt)Printed Time' ) + ': '}${foot.gen_time}</p>
		<p class="caption">${head.start_time} - ${head.end_time}</p>
	</div>

        <table id="body-table">
            <!--caption>${head.title}</caption-->
            <thead>
                <tr>
                    <th style="text-align: left;">${_( '(rpt)Terminal' )}</th>
                    <th style="text-align: left;">${_( '(rpt)Time' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Total' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Orders' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Guests' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Items' )}</th>
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
                    <td>${_( '(rpt)Summary' ) + ':'}</td>
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
