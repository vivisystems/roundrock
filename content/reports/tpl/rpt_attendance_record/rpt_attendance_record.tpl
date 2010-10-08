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
                       <span class="caption">${queryFormLabel.user_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.user|escape}</span>

                       <span class="caption">${queryFormLabel.job_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.job|escape}</span>

                       <span class="caption">${queryFormLabel.sortby_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.sortby|escape}</span>
                       <br>
                       <span class="caption">${queryFormLabel.database_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.database|escape}</span>
                </td>
            </tr>
        </table>
{for branch in body}
<br>
<p class="caption"><font color="red">[ ${branch.branch_id} ]</font></p>
{for master in branch.clerk}
        <table id="body-table">
            <!--caption>${master.username}</caption-->
            <thead>
            	<tr>
            		<td colspan="8" class="subtitle">${master.username}</td>
            	</tr>
                <tr class="fields">
                    <th style="text-align: left;">${_( '(rpt)Job' )}</th>
                    <th style="text-align: left;">${_( '(rpt)Clock In' )}</th>
                    <th style="text-align: left;">${_( '(rpt)Clock Out' )}</th>
                    <th style="text-align: left;">${_( '(rpt)Span Time' )}</th>
                </tr>
            </thead>
            <tbody>
{for stamp in master.clockStamps}
                <tr>
                    <td style="text-align: left;">${stamp.job}</td>
                    <td style="text-align: left;">${stamp.clockin_time}</td>
                    <td style="text-align: left;">${stamp.clockout_time}</td>
                    <td style="text-align: left;">${stamp.SpanTime}</td>
                </tr>
{/for}
            </tbody>
            <tfoot>
                <tr>
                    <td>${_( '(rpt)Records Found' ) + ':'}</td>
                    <td>${master.clockStamps.length|format:0}</td>
                    <td>${_( '(rpt)Summary' ) + ':'}</td>
                    <td>${master.total_spantime}</td>
                </tr>
            </tfoot>
        </table>
        </br>
{/for}
{/for}
<table width="98%">
<thead>
    <tr class="subtitle">
        <td>${_( '(rpt)Total Work Time' ) + ':'}</td>
        <td style="text-align: right;">${foot.total_spantime}</td>
    </tr>
</thead>
</table>
</div>
<!--/div -->
