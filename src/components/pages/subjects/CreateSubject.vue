<template>
  <v-dialog width="auto" v-model="open">
    <Form @submit="submit" ref="subjectFormRef">
      <v-card width="400" title="Create Subject">
        <v-card-text class="pb-1">
          <Field name="name" v-slot="{ handleChange, handleBlur, errors }">
            <v-text-field
              v-model="form.name"
              label="Subject name"
              :error-messages="errors"
              @update:model-value="handleChange"
              @blur="handleBlur"
            ></v-text-field>
          </Field>
        </v-card-text>
        <v-card-text class="pt-0">
          <Field name="centerId" v-slot="{ handleChange, handleBlur, errors }">
            <v-select
              v-model="form.centerId"
              :items="centers"
              label="Centers"
              item-title="name"
              item-value="id"
              :error-messages="errors"
              @update:model-value="handleChange"
              @blur="handleBlur"
            ></v-select>
          </Field>
        </v-card-text>
        <template v-slot:actions>
          <v-btn @click="open = false">Cancel</v-btn>
          <v-btn type="submit" color="primary" text="Save" :loading="loading" :disabled="loading"></v-btn>
        </template>
      </v-card>
    </Form>
  </v-dialog>
</template>


<script setup lang="ts">
import { ref, defineModel, defineEmits, defineProps, watch } from 'vue'
import { Form, Field } from 'vee-validate'
import { createSubjects, editSubject } from '@/services/pages/subjects'
import type { SubjectForm, Subject } from '@/types/subject.types'
import type { Center } from '@/types/center.types'
interface Emits {
  (e: 'updateData'): void
  (e: 'clearForm'): void
}
interface Props {
  centers: Center[]
  formForEdit: Subject
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()
const open = defineModel('open')
const subjectFormRef = ref()
const loading = ref(false)

const form = ref<SubjectForm>({
  name: '',
  centerId: undefined,
})

watch(
  () => open.value,
  (newValue) => {
    if (newValue && props.formForEdit?.id) {
      form.value.name = props.formForEdit.name
      form.value.centerId = props.formForEdit.center.id
    }
    if (!newValue) {
      emits('clearForm')
      form.value = {
        name: '',
        centerId: undefined,
      }
    }
  }
)

const submit = async () => {
  try {
    loading.value = true
    if (props.formForEdit?.id) {
      await editSubject(form.value, props.formForEdit.id)
    } else {
      await createSubjects(form.value)
    }

    open.value = false
    emits('updateData')
  } catch (err) {
    const errors = (err as any)?.response?.data?.errors
    if (errors) {
      subjectFormRef.value?.setErrors(errors)
    }
    console.log(err)
  } finally {
    loading.value = false
  }
}
</script>