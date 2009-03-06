<div class="paper" style="overflow:auto;">
<!-- div id="printhead" class="paper" -->
<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
<!-- /div>
<div id="docbody" class="paper" -->

<p align="left">${head.store.name}</p>
<p align="left">${head.store.branch}</p>
<p align="left">${head.store.telephone1}</p>
<p align="left">Terminal: ${head.store.terminal_no}</p>
<p align="left">Clerk: ${head.clerk_displayname}</p>
<p align="right">Printed Time: ${foot.gen_time}</p>

        <table id="body-table">
            <caption>${head.title}</caption>
            <thead>
                <tr>
                    <th style="text-align: left;">User Name</th>
                    <th style="text-align: left;">Display Name</th>
                    <th style="text-align: left;">Access Group</th>
                </tr>
            </thead>
            <tbody>
{for user in body}
                <tr>
                    <td style="text-align: left;">${user.username}</td>
                    <td style="text-align: left;">${user.displayname}</td>
                    <td style="text-align: left;">${user.group}</td>
                </tr>
{/for}
            </tbody>
            <tfoot>
                <tr>
                <td colspan="4"></td>
                </tr>
            </tfoot>
        </table>
        </br>

</div>
<!--/div -->
