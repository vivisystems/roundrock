<div class="paper" style="overflow:auto;">
<!-- div id="printhead" class="paper" -->
<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
<!-- /div>
<div id="docbody" class="paper" -->

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
