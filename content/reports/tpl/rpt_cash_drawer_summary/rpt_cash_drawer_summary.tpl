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
                <th style="text-align: left;">${_( '(rpt)Clerk' )}</th>
                <th style="text-align: left;">${_( '(rpt)Event' )}</th>
                <th style="text-align: right;">${_( '(rpt)Number of Events' )}</th>
            </tr>
        </thead>
        <tbody>
{for item in body}
            <tr>
                <td style="text-align: left;">${item.clerk_displayname}</td>
                <td style="text-align: left;">${_( '(rpt)' + item.event_type )}</td>
                <td style="text-align: right;">${item.num_events}</td>
            </tr>
{/for}
        </tbody>
        <tfoot>
            <tr>
                <td colspan="2">${_( '(rpt)Summary' ) + ':'}</td>
                <td style="text-align: right;">${foot.foot_data.total_num_events}</td>
            </tr>
        </tfoot>
    </table>
    <br />
</div>
<br />
