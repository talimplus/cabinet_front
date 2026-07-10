<template>
  <div class="markdown-body" v-html="html"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

defineOptions({ name: 'MarkdownView' })

const props = defineProps<{ source?: string | null }>()

const html = computed(() => {
  if (!props.source) return ''
  const raw = marked.parse(props.source, { async: false }) as string
  return DOMPurify.sanitize(raw)
})
</script>

<style scoped>
.markdown-body {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: rgba(46, 38, 61, 0.9);
  word-wrap: break-word;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4) {
  margin: 16px 0 8px;
  font-weight: 600;
  line-height: 1.3;
}

.markdown-body :deep(h1) {
  font-size: 1.25rem;
}

.markdown-body :deep(h2) {
  font-size: 1.125rem;
}

.markdown-body :deep(h3) {
  font-size: 1rem;
}

.markdown-body :deep(p) {
  margin: 0 0 10px;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin: 0 0 10px;
  padding-left: 24px;
}

.markdown-body :deep(li) {
  margin-bottom: 4px;
}

.markdown-body :deep(code) {
  background: rgba(46, 38, 61, 0.06);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 0.85em;
}

.markdown-body :deep(pre) {
  background: rgba(46, 38, 61, 0.06);
  border-radius: 8px;
  padding: 12px;
  overflow-x: auto;
  margin: 0 0 10px;
}

.markdown-body :deep(pre code) {
  background: transparent;
  padding: 0;
}

.markdown-body :deep(blockquote) {
  border-left: 3px solid rgba(1, 192, 200, 0.6);
  margin: 0 0 10px;
  padding: 4px 12px;
  color: rgba(46, 38, 61, 0.68);
}

.markdown-body :deep(table) {
  border-collapse: collapse;
  margin: 0 0 10px;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid rgba(46, 38, 61, 0.12);
  padding: 6px 10px;
}
</style>
