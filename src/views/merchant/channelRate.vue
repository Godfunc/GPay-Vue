<template>
  <div>
    <el-dialog title="费率" :visible.sync="dialogFormVisible" width="55%">
      <el-collapse accordion>
        <el-collapse-item v-for="item in list" :key="item.payCategoryCode" :title="item.payCategoryName" :name="item.payCategoryCode">
          <el-table :data="item.channelList" style="width: 100%">
            <el-table-column prop="payChannelCode" label="渠道主类编号" align="center">
              <template>
                {{ item.payCategoryCode }}
              </template>
            </el-table-column>
            <el-table-column prop="payChannelCode" label="渠道子类编号" align="center" />
            <el-table-column prop="payChannelName" label="渠道子类名称" />
            <el-table-column label="费率">
              <template slot-scope="scope">
                <el-input v-model="scope.row.rate" placeholder="该费率需要大于代理得费率或者平台通道费率" />
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center">
              <template slot-scope="scope">
                <el-button v-permission="'merchant:merchantChannelRate:save'" type="primary" @click="setRateDate(scope.row)">保存</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>
      </el-collapse>
    </el-dialog>
  </div>
</template>

<script>
import { list, save } from '@/api/merchantChannelRate'

export default {
  data() {
    return {
      merchantCode: undefined,
      dialogFormVisible: false,
      list: undefined,
      loading: true,
      temp: {
        id: undefined,
        categoryChannelId: undefined,
        rate: undefined
      }
    }
  },
  methods: {
    handleList(merchantCode) {
      this.loading = true
      this.merchantCode = merchantCode
      list(merchantCode).then(response => {
        this.list = response.data
        this.loading = false
      })
      this.dialogFormVisible = true
    },
    setRateDate(data) {
      data.merchantCode = this.merchantCode
      save(data).then(response => {
        if (response.code === 0) {
          this.handleList(this.merchantCode)
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
