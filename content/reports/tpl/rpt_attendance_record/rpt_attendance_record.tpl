<!---->
<div id="printhead">
	<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
</div>
<div id="docbody" class="paper">
	<p class="heading_store">${head.store.name} - ${head.store.branch}</p>
	<p class="heading_store">${head.store.telephone1}</p>

	<div style="float: left;">
		<p class="heading_p">${_( 'Terminal' ) + ': '}${head.store.terminal_no}</p>
		<p class="heading_p">${_( 'Clerk' ) + ': '}${head.clerk_displayname}</p>
		<p class="caption">${head.title}</p>
	</div>

	<div style="float: right;">
		<p class="heading_p">&nbsp;</p>
		<p class="heading_p" align="right">${_( 'Printed Time' ) + ': '}${foot.gen_time}</p>
		<p class="caption">${head.start_time} - ${head.end_time}</p>
	</div>

{for master in body}
        <table id="body-table">
            <!--caption>${master.username}</caption-->
            <thead>
            	<tr>
            		<td colspan="8" class="subtitle">${master.username}</td>
            	</tr>
                <tr class="fields">
                    <th style="text-align: left;">${_( 'Job' )}</th>
                    <th style="text-align: left;">${_( 'Clock In' )}</th>
                    <th style="text-align: left;">${_( 'Clock Out' )}</th>
                    <th style="text-align: left;">${_( 'Span Time' )}</th>
                </tr>
            </thead>
            <tbody>
{for stamp in master.clockStamps}
                <tr>
                    <td style="text-align: left;">${stamp.job}</td>
                    <td style="text-align: left;">${stamp.InTime}</td>
                    <td style="text-align: left;">${stamp.OutTime}</td>
                    <td style="text-align: left;">${stamp.SpanTime}</td>
                </tr>
{/for}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="3">${_( 'Summary' ) + ':'}</td>
                    <td>${master.total_spantime}</td>
                </tr>
            </tfoot>
        </table>
        </br>
{/for}
</div>
<!--/div -->
