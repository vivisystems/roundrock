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
		<p class="heading_p" style="text-align: right;">${_( '(rpt)Printed Time' ) + ': '}${foot.gen_time}</p>
		<p class="caption" style="text-align: right;">${head.start_time} - ${head.end_time}</p>
	</div>
        <table id="condition-table">
            <tr>
                <td class="condition-title"><span class="caption">${_('(rpt)Condition') + ' - '}</span></td>
                <td align="left" >
                       <span class="caption">${queryFormLabel.terminal_no_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.terminal_no|escape}</span>
                       <span class="caption">${queryFormLabel.period_type_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.period_type|escape}</span>
                       <span class="caption">${queryFormLabel.start_hour_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.start_hour|escape}</span>
                       <span class="caption">${queryFormLabel.end_hour_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.end_hour|escape}</span>
                       <span class="caption">${queryFormLabel.sortby_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.sortby|escape}</span>
                       <br>
                       <span class="caption">${queryFormLabel.database_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.database|escape}</span>
                </td>
           </tr>
       </table>
        <table id="body-table">
            <!--caption>${head.title}</caption-->
            <thead>
                <tr>
{if head.terminal_no}
                    <th style="text-align: center;">${_( '(rpt)Terminal' )}</th>
{/if}
                    <th style="text-align: center;">${_( '(rpt)Date' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Hour' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Total' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Number of Orders' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Number of Guests' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Number of Items' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Total/Guest' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Total/Order' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Gross Sales/Guest' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Gross Sales/Order' )}</th>
                </tr>
            </thead>
            <tbody>
{for detail in body}
                <tr>
{if head.terminal_no}
                    <td style="text-align: left;">${detail.terminal_no}</td>
{/if}
                    <td style="text-align: left;">${detail.Date}</td>
                    <td style="text-align: left;">${detail.Hour}</td>
                    <td style="text-align: right;">${detail.HourTotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.OrderNum|default:0|format:0}</td>
                    <td style="text-align: right;">${detail.Guests|default:0|format:0}</td>
                    <td style="text-align: right;">${detail.ItemsCount|default:0|format:0}</td>
                    <td style="text-align: right;">${detail.NetPerGuest|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.NetPerOrder|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.GrossPerGuest|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.GrossPerOrder|default:0|viviFormatPrices:true}</td>
                </tr>
{/for}
            </tbody>
            <tfoot>
                <tr>
                    <td style="text-align: left;">${_( '(rpt)Records Found' ) + ': '}${body.length|format:0}</td>
{if head.terminal_no}
<td/>
{/if}
                    <td>${_( '(rpt)Summary' ) + ':'}</td>
                    <td style="text-align: right;">${foot.HourTotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.OrderNum|default:0|format:0}</td>
                    <td style="text-align: right;">${foot.Guests|default:0|format:0}</td>
                    <td style="text-align: right;">${foot.ItemsCount|default:0|format:0}</td>
                    <td style="text-align: right;">${foot.NetPerGuest|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.NetPerOrder|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.GrossPerGuest|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.GrossPerOrder|default:0|viviFormatPrices:true}</td>
                </tr>
            </tfoot>
        </table>
        </br>

</div>
<!--/div -->
