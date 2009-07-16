<!-- div class="paper" style="overflow:auto;" -->
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
		<p class="heading_p" style="text-align: right;">${_( '(rpt)Printed Time' ) + ': '}${foot.gen_time}</p>
		<p class="caption" style="text-align: right;">${head.start_time} - ${head.end_time}</p>
	</div>

{for master in body}
        <table id="body-table">
            <!--caption>${master.terminal_no} : ${master.starttime} - ${master.endtime}</caption-->
            <thead>
            	<tr>
            		<td colspan="8" class="subtitle">${master.terminal_no} : ${master.starttime} - ${master.endtime}</td>
            	</tr>
                <tr class="fields">
                    <th style="text-align: left;">${_( '(rpt)Sale Period' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Shift' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Balance' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Cash' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Net Sales' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Giftcard Excess' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Deposit' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Refund' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Credit' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Ledger In' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Ledger Out' )}</th>
                </tr>
            </thead>
            <tfoot>
            	<tr></tr>
            </tfoot>
            <tbody>
                <tr style="border-bottom: 2px solid #b5b093;">
                	<td style="text-align: left;">${master.sale_period|unixTimeToString:'yyyy-MM-dd'}</td>
                	<td style="text-align: right;">${master.shift_number}</td>
                	<td style="text-align: right;">${master.balance|default:0|viviFormatPrices:true}</td>
                	<td style="text-align: right;">${master.cash|default:0|viviFormatPrices:true}</td>
                	<td style="text-align: right;">${master.sales|default:0|viviFormatPrices:true}</td>
                	<td style="text-align: right;">${master.excess|default:0|viviFormatPrices:true}</td>
                	<td style="text-align: right;">${master.deposit|default:0|viviFormatPrices:true}</td>
                	<td style="text-align: right;">${master.refund|default:0|viviFormatPrices:true}</td>
                	<td style="text-align: right;">${master.credit|default:0|viviFormatPrices:true}</td>
                	<td style="text-align: right;">${master.ledger_in|default:0|viviFormatPrices:true}</td>
                	<td style="text-align: right;">${master.ledger_out|default:0|viviFormatPrices:true}</td>
                </tr>
                <tr style="border-top: 1px solid #4ca;">
                	<td colspan="6" style="vertical-align: top;">
                		<table style="width: 100%;">
                			<tr class="fields" style="color: gray; font-style: italic;">
                				<th style="text-align: left;">${_( '(rpt)Payment Type' )}</th>
                				<th style="text-align: right;">${_( '(rpt)Payment Amount' )}</th>
                				<th style="text-align: right;">${_( '(rpt)Payment Count' )}</th>
                			</tr>
{for detail in master.ShiftChangeDetail}
{if detail.type != 'destination'}
						    <tr>
						        <td style="text-align: left;">${_('(rpt)' + detail.type)}{if detail.name.length > 0}&nbsp;( ${detail.name} ){/if}</td>
						        <td style="text-align: right;">${detail.amount|default:0|viviFormatPrices:true}</td>
						        <td style="text-align: right;">${detail.count|format:0}</td>
						    </tr>
{/if}
{/for}
						</table>
					</td>
					<td colspan="5" style="vertical-align: top;">
						<table style="width: 100%;">
							<tr class="fields" style="color: gray; font-style: italic;">
								<th style="text-align: left;">${_( '(rpt)Destination' )}</th>
								<th style="text-align: right;">${_( '(rpt)Destination Amount' )}</th>
								<th style="text-align: right;">${_( '(rpt)Destination Count' )}</th>
							</tr>
{for detail in master.ShiftChangeDetail}
{if detail.type == 'destination'}
							<tr>
								<td style="text-align: left;">${detail.name}</td>
								<td style="text-align: right;">${detail.amount|default:0|viviFormatPrices:true}</td>
								<td style="text-align: right;">${detail.count|default:0}</td>
							</tr>
{/if}
{/for}
						</table>
					</td>
				</tr>
            </tbody>
        </table>
        </br>
{/for}
</div>
<!--/div -->
