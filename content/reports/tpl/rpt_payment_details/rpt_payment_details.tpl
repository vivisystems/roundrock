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
                <br/>
	</div>
        <table id="condition-table">
            <tr>
                <td class="condition-title"><span class="caption">${_('(rpt)Condition') + ' - '}</span></td>
                <td align="left" >
                       <span class="caption">${queryFormLabel.terminal_no_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.terminal_no|escape}</span>
                       <span class="caption">${queryFormLabel.shift_no_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.shift_no|escape}</span>
                       <span class="caption">${queryFormLabel.period_type_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.period_type|escape}</span>
                       <span class="caption">${queryFormLabel.payment_type_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.payment_type|escape}</span>
                       <span class="caption">${queryFormLabel.sortby_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.sortby|escape}</span>
                       <span class="caption">${queryFormLabel.database_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.database|escape}</span>
                </td>
           </tr>
       </table>
{for paymentGroup in body}
        <br/>
        <table id="body-table">
            <caption>${_('(rpt)' + paymentGroup_index)}</caption>
            <thead>
                <tr>
                    <th style="text-align: center;">${_( '(rpt)Terminal' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Clerk' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Sale Period' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Shift' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Time' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Sequence' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Payment Subtype' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Amount' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Face Value' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Groupable Payment Count' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Memo' )}</th>
                </tr>
            </thead>
            <tbody>
{for detail in paymentGroup}
                <tr id="${detail.id}">
                    <td style="text-align: center;">${detail.terminal_no}</td>
                    <td style="text-align: left;">${detail.service_clerk_displayname|default:''}</td>
                    <td style="text-align: center;">${detail.sale_period|unixTimeToString:'saleperiod'}</td>
                    <td style="text-align: center;">${detail.shift_number}</td>
                    <td style="text-align: center;">${detail.time|unixTimeToString}</td>
                    <td style="text-align: center;" class="hyperlink">${detail.sequence}</td>
                    <td style="text-align: center;">${detail.subtype|default:''}</td>
                    <td style="text-align: right;">${detail.amount|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.facevalue|default:''|viviFormatPrices:true}</td>
                    <td style="text-align: center;">${detail.count|default:''}</td>
                    <td style="text-align: right;">${detail.memo|default:''}</td>
                </tr>
{/for}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="11" style="text-align: left;">${_( '(rpt)Records Displayed' ) }: ${paymentGroup.length|format:0}</td>
                </tr>
            </tfoot>
        </table>
        </br>
{/for}
</div>
<!--/div -->
