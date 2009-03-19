<!-- div class="paper" style="overflow:auto;" -->
<div id="printhead">
	<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
</div>
<div id="docbody" class="paper">
	<p class="heading_store">${head.store.name} - ${head.store.branch}</p>
	<p class="heading_store">${head.store.telephone1}</p>

	<div style="float: left;">
		<p class="heading_p">Terminal: ${head.store.terminal_no}</p>
		<p class="heading_p">Clerk: ${head.clerk_displayname}</p>
		<p class="caption">${head.title}</p>
	</div>

	<div style="float: right;">
		<p class="heading_p">&nbsp;</p>
		<p class="heading_p" align="right">Printed Time: ${foot.gen_time}</p>
		<p class="caption">${head.start_time} - ${head.end_time}</p>
	</div>

{for master in body}
        <table id="body-table">
            <!--caption>${master.terminal_no} : ${master.starttime} - ${master.endtime}</caption-->
            <thead>
            	<tr>
            		<td colspan="8" style="text-align: left;
							  font-weight: bold;
							  font-size: 12pt;
							  color: #292929;
							  margin: 10px 5px;
							  padding: 4px;">${master.terminal_no} : ${master.starttime} - ${master.endtime}</td>
            	</tr>
                <tr style="text-align: left;
							  color: #56523a;
							  border-top: 2px solid #b5b093;
							  border-bottom: 1px solid #b5b093;
							  background-color: #f5f2ec;
							  font-size: 11pt;
							  padding: 4px;">
                    <th style="text-align: left;">Sale Period</th>
                    <th style="text-align: right;">Shift No.</th>
                    <th style="text-align: right;">Balance</th>
                    <th style="text-align: right;">Cash</th>
                    <th style="text-align: right;">Sales</th>
                    <th style="text-align: right;">Excess</th>
                    <th style="text-align: right;">Ledger In</th>
                    <th style="text-align: right;">Ledger Out</th>
                </tr>
            </thead>
            <tfoot>
            	<tr></tr>
            </tfoot>
            <tbody>
                <tr style="border-bottom: 2px solid #b5b093;">
                	<td style="text-align: left;">${master.sale_period}</td>
                	<td style="text-align: right;">${master.shift_number}</td>
                	<td style="text-align: right;">${master.balance|default:0|viviFormatPrices:true}</td>
                	<td style="text-align: right;">${master.cash|default:0|viviFormatPrices:true}</td>
                	<td style="text-align: right;">${master.sales|default:0|viviFormatPrices:true}</td>
                	<td style="text-align: right;">${master.excess|default:0|viviFormatPrices:true}</td>
                	<td style="text-align: right;">${master.ledger_in|default:0|viviFormatPrices:true}</td>
                	<td style="text-align: right;">${master.ledger_out|default:0|viviFormatPrices:true}</td>
                </tr>
                <tr style="border-top: 1px solid #4ca;">
                	<td colspan="4" style="vertical-align: top;">
                		<table style="width: 100%;">
                			<tr style="color: gray; font-style: italic;">
                				<th style="text-align: left;">Type</th>
                				<th style="text-align: right;">Amount</th>
                				<th style="text-align: right;">Count</th>
                			</tr>
{for detail in master.ShiftChangeDetail}
{if detail.type != 'destination'}
						    <tr>
						        <td style="text-align: left;">${detail.type}{if detail.name.length > 0}&nbsp;( ${detail.name} ){/if}</td>
						        <td style="text-align: right;">${detail.amount|default:0|viviFormatPrices:true}</td>
						        <td style="text-align: right;">${detail.count|default:0}</td>
						    </tr>
{/if}
{/for}
						</table>
					</td>
					<td colspan="4" style="vertical-align: top;">
						<table style="width: 100%;">
							<tr style="color: gray; font-style: italic;">
								<th style="text-align: left;">Destination</th>
								<th style="text-align: right;">Amount</th>
								<th style="text-align: right;">Count</th>
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
