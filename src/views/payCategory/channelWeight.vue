<template>
  <div>
    <el-dialog title="权重" :visible.sync="dialogFormVisible" width="55%">
      <el-table :data="list" style="width: 100%">
        <el-table-column prop="payCategoryName" label="渠道主类名" align="center" />
        <el-table-column prop="payCategoryCode" label="渠道子类编号" align="center" />
        <el-table-column prop="payChannelName" label="渠道子类名" />
        <el-table-column prop="payChannelCode" label="渠道子类编号" />
        <el-table-column label="权重" prop="weight">
          <template slot-scope="scope">
            <el-input v-model="scope.row.weight" placeholder="权重" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button v-permission="'merchant:payCategoryChannel:weight'" type="primary" @click="setWeight(scope.row)">保存</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { list, weight } from '@/api/payCategoryChannel'

export default {
  data() {
    return {
      payCategoryId: undefined,
      dialogFormVisible: false,
      list: undefined,
      loading: true,
      temp: {
        id: undefined,
        weight: undefined
      }
    }
  },
  methods: {
    handleList(payCategoryId) {
      this.loading = true
      this.payCategoryId = payCategoryId
      list(payCategoryId).then(response => {
        this.list = response.data
        this.loading = false
      })
      this.dialogFormVisible = true
    },
    setWeight(data) {
      weight(data).then(response => {
        if (response.code === 0) {
          this.handleList(this.payCategoryId)
          this.$message({
            type: 'success',
            message: '保存成功!'
          })
        }
      })
    }
  }
}
</script>
