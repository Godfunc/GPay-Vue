<template>
  <div>
    <el-dialog title="创建订单" :visible.sync="dialogFormVisible" width="55%">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 80%; margin-left:50px;">
        <el-form-item label="下单" prop="createUrl">
          <el-input v-model="temp.createUrl" placeholder="下单地址" />
        </el-form-item>
        <el-form-item label="渠道" prop="type">
          <el-select v-model="temp.type" filterable placeholder="渠道主类">
            <el-option
              v-for="item in payCategoryList"
              :key="item.code"
              :label="item.name + '-' + item.code"
              :value="item.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商户" prop="merchantCode">
          <el-select v-model="temp.merchantCode" filterable placeholder="商户">
            <el-option
              v-for="item in merchantList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="金额" prop="amount">
          <el-input v-model="temp.amount" placeholder="金额" />
        </el-form-item>
        <el-form-item label="商品" prop="goodName">
          <el-input v-model="temp.goodName" placeholder="商品名称" />
        </el-form-item>
        <el-form-item label="通知" prop="notifyUrl">
          <el-input v-model="temp.notifyUrl" placeholder="通知地址" />
        </el-form-item>
        <el-form-item label="密钥" prop="privateKey">
          <el-input v-model="temp.privateKey" type="textarea" :rows="2" placeholder="商户私钥" />
        </el-form-item>
      </el-form>
      <el-input v-show="resultVisable" v-model="result" type="textarea" :rows="2" placeholder="结果" />
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="doCreateOrder()">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { list as cateList } from '@/api/payCategory'
import { list as mList } from '@/api/merchant'
import { createOrder } from '@/api/order'

export default {
  data() {
    return {
      dialogFormVisible: false,
      merchantList: undefined,
      payCategoryList: undefined,
      result: undefined,
      resultVisable: false,
      temp: {
        merchantCode: undefined,
        type: undefined,
        amount: undefined,
        createUrl: undefined,
        privateKey: undefined,
        goodName: '测试商品',
        notifyUrl: undefined
      },
      rules: {
        merchantCode: [{ required: true, message: '请选择下单商户', trigger: 'blur' }],
        amount: [{ required: true, message: '下单金额不能为空', trigger: 'blur' }],
        createUrl: [{ required: true, message: '下单地址不能为空', trigger: 'blur' }],
        notifyUrl: [{ required: true, message: '通知地址不能为空', trigger: 'blur' }],
        privateKey: [{ required: true, message: '商户密钥不能为空', trigger: 'blur' }],
        goodName: [{ required: true, message: '商品名称不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '渠道不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    fetchData() {
      cateList().then(response => {
        if (response.data) {
          this.payCategoryList = response.data
        }
      })
      mList(1).then(response => {
        if (response.data) {
          this.merchantList = response.data
        }
      })
    },
    resetTemp() {
      this.temp = {
        merchantCode: undefined,
        type: undefined,
        amount: undefined,
        createUrl: undefined,
        privateKey: undefined,
        goodName: '测试商品',
        notifyUrl: undefined
      }
    },
    create() {
      this.fetchData()
      this.resetTemp()
      this.resultVisable = false
      this.result = undefined
      this.dialogFormVisible = true
    },
    doCreateOrder() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createOrder(this.temp).then(response => {
            if (response.code === 0) {
              this.result = JSON.stringify(response.data)
              this.resultVisable = true
              this.$message({
                type: 'success',
                message: '下单成功!'
              })
            }
          })
        }
      })
    }
  }
}
</script>
