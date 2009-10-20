{if journal}
${content}
{elseif sequence}
<H2>${_('Order sequence [%S] does not exist', [sequence])}</H2>
{else}
<H2>${_('Unable to display order; no order sequence given')}</H2>
{/if}
