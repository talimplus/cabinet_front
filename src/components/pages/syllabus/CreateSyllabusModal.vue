<template>
  <v-dialog width="440" v-model="open">
    <Form @submit="submit" ref="syllabusFormRef">
      <v-card :title="$t('syllabuses.form.createTitle')">
        <v-card-text class="pb-1">
          <Field name="name" rules="required" v-slot="{ handleChange, handleBlur, errors }">
            <v-text-field
              v-model="form.name"
              :label="$t('syllabuses.form.name')"
              :error-messages="errors"
              @update:model-value="handleChange"
              @blur="handleBlur"
            ></v-text-field>
          </Field>
        </v-card-text>
        <v-card-text class="py-1">
          <Field name="subjectId" rules="required" v-slot="{ handleChange, handleBlur, errors }">
            <v-select
              v-model="form.subjectId"
              :items="subjects"
              :label="$t('syllabuses.form.subject')"
              item-title="name"
              item-value="id"
              :error-messages="errors"
              @update:model-value="handleChange"
              @blur="handleBlur"
            ></v-select>
          </Field>
        </v-card-text>
        <v-card-text class="pt-1">
          <v-textarea
            v-model="form.description"
            :label="$t('syllabuses.form.description')"
            rows="3"
          ></v-textarea>
        </v-card-text>
        <template v-slot:actions>
          <v-btn @click="open = false">{{ $t('common.cancel') }}</v-btn>
          <v-btn
            type="submit"
            color="primary"
            :text="$t('common.save')"
            :loading="loading"
            :disabled="loading"
          ></v-btn>
        </template>
      </v-card>
    </Form>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Form, Field } from 'vee-validate'
import { createSyllabus } from '@/services/pages/syllabuses'
import type { SyllabusForm } from '@/types/syllabus.types'
import type { Subject } from '@/types/subject.types'

defineOptions({ name: 'CreateSyllabusModal' })

interface Emits {
  (e: 'updateData'): void
}
interface Props {
  subjects: Subject[]
}

defineProps<Props>()
const emits = defineEmits<Emits>()
const open = defineModel('open')
const syllabusFormRef = ref()
const loading = ref(false)

const form = ref<SyllabusForm>({
  name: '',
  description: '',
  subjectId: undefined,
})

watch(
  () => open.value,
  (newValue) => {
    if (!newValue) {
      form.value = {
        name: '',
        description: '',
        subjectId: undefined,
      }
    }
  },
)

const submit = async () => {
  try {
    loading.value = true
    await createSyllabus({
      name: form.value.name,
      subjectId: form.value.subjectId,
      description: form.value.description?.trim() || undefined,
    })
    open.value = false
    emits('updateData')
  } catch (err) {
    const errors = (err as any)?.response?.data?.errors
    if (errors) {
      syllabusFormRef.value?.setErrors(errors)
    }
    console.log(err)
  } finally {
    loading.value = false
  }
}
</script>
