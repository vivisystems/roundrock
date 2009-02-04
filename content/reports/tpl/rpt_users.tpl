<!-- div class="paper" style="overflow:auto;" -->
<div id="printhead" class="paper">
<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
</div>
<div id="docbody" class="paper">

        <table id="body-table">
            <caption>${head.title}</caption>
            <thead>
                <tr>
                    <th>User Name</th>
                    <th>Display Name</th>
                    <th>Access Group</th>
                </tr>
            </thead>
            <tbody>
{for user in body}
                <tr>
                    <td>${user.username}</td>
                    <td>${user.displayname}</td>
                    <td>${user.group}</td>
                </tr>
{/for}
            </tbody>
            <tfoot>
                <tr>
                <td colspan="4">{i18n summary}:${foot.summary}</td>
                </tr>
            </tfoot>
        </table>
        </br>

</div>
<!--/div -->
