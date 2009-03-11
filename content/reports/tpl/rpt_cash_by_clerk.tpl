<!-- div class="paper" style="overflow:auto;" -->
<div id="printhead">
<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
</div>
<div id="docbody" class="paper">
<p align="left">${head.store.name}</p>
<p align="left">${head.store.branch}</p>
<p align="left">${head.store.telephone1}</p>
<p align="left">Terminal: ${head.store.terminal_no}</p>
<p align="left">Clerk: ${head.clerk_displayname}</p>
<p align="right">Printed Time: ${foot.gen_time}</p>
<p align="right">${head.start_time} - ${head.end_time}</p>

{for master in body}
        <table id="body-table">
            <caption>${master.terminal_no} : ${master.starttime} - ${master.endtime}</caption>
            <thead>
                <tr>
                    <th>Sale Period</th>
                    <th>Shift No.</th>
                    <th>Balance</th>
                    <th>Cash</th>
                    <th>Sales</th>
                    <th>Excess</th>
                    <th>Ledger In</th>
                    <th>Ledger Out</th>
                </tr>
            </thead>
            <tbody>
                <tr style="border-bottom: 2px solid #b5b093;">
                	<td>${master.sale_period}</td>
                	<td>${master.shift_number}</td>
                	<td>${master.balance|default:0|viviFormatPrices:true}</td>
                	<td>${master.cash|default:0|viviFormatPrices:true}</td>
                	<td>${master.sales|default:0|viviFormatPrices:true}</td>
                	<td>${master.excess|default:0|viviFormatPrices:true}</td>
                	<td>${master.ledger_in|default:0|viviFormatPrices:true}</td>
                	<td>${master.ledger_out|default:0|viviFormatPrices:true}</td>
                </tr>
                <tr style="border-top: 1px solid #4ca;">
                	<td colspan="4" style="vertical-align: top;">
                		<table style="width: 100%;">
                			<tr style="color: gray; font-style: italic;">
                				<th style="text-align: left;">Type</th>
                				<th>Amount</th>
                				<th>Count</th>
                			</tr>
{for detail in master.ShiftChangeDetail}
{if detail.type != 'destination'}
						    <tr>
						        <td style="text-align: left;">${detail.type}{if detail.name.length > 0}&nbsp;( ${detail.name} ){/if}</td>
						        <td>${detail.amount|default:0|viviFormatPrices:true}</td>
						        <td>${detail.count|default:0}</td>
						    </tr>
{/if}
{/for}
						</table>
					</td>
					<td colspan="4" style="vertical-align: top;">
						<table style="width: 100%;">
							<tr style="color: gray; font-style: italic;">
								<th style="text-align: left;">Destination</th>
								<th>Amount</th>
								<th>Count</th>
							</tr>
{for detail in master.ShiftChangeDetail}
{if detail.type == 'destination'}
							<tr>
								<td style="text-align: left;">${detail.name}</td>
								<td>${detail.amount|default:0|viviFormatPrices:true}</td>
								<td>${detail.count|default:0}</td>
							</tr>
{/if}
{/for}
						</table>
					</td>
				</tr>
            </tbody>
            <tfoot>
            </tfoot>
        </table>
        </br>
{/for}
</div>
<!--/div -->
