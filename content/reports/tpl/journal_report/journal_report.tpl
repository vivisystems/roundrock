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
        <table id="body-table">
            <thead>
                <tr>
                    <th style="text-align: center;">${_( '(rpt)Time' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Sequence' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Branch' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Terminal' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Status' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Void Clerk' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Void Time' )}</th>
                </tr>
            </thead>
            <tbody>
{for detail in body}
                <tr id="${detail.id}">
                    <td style="text-align: center;">${detail.created|unixTimeToString}</td>
                    <td style="text-align: center;" class="hyperlink">${detail.sequence}</td>
                    <td style="text-align: center;">${detail.branch}</td>
                    <td style="text-align: center;">${detail.terminal_no}</td>
                    <td style="text-align: center;">${detail.status}</td>
                    <td style="text-align: center;">${detail.void_clerk_displayname|default:''}</td>
                    <td style="text-align: center;">${detail.void_time|unixTimeToString}</td>
                </tr>
{/for}
            </tbody>
            <tfoot>
            </tfoot>
        </table>
        </br>

</div>
<!--/div -->
