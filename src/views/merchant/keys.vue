<template>
  <el-dialog title="公钥" :visible.sync="dialogFormVisible" width="40%">
    <el-form :model="keyTemp" label-position="left">
      <el-form-item label="商户公钥" prop="publicKey">
        <el-input v-model="keyTemp.publicKey" type="textarea" :rows="4" placeholder="商户公钥" />
      </el-form-item>
      <el-form-item label="平台公钥" prop="platPublicKey">
        <el-input v-model="keyTemp.platPublicKey" type="textarea" :rows="4" placeholder="平台公钥" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button v-permission="'merchant:merchant:refreshKeys'" type="primary" @click="refreshPlatKeys(keyTemp.id)">
        刷新密钥
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { refreshKeys } from '@/api/merchant'

export default {
  data() {
    return {
      dialogFormVisible: false,
      keyTemp: {
        id: undefined,
        publicKey: undefined,
        platPublicKey: undefined
      }
    }
  },
  methods: {
    handleKeys(row) {
      this.keyTemp.publicKey = row.publicKey
      this.keyTemp.platPublicKey = row.platPublicKey
      this.keyTemp.id = row.id
      this.dialogFormVisible = true
    },
    refreshPlatKeys(id) {
      refreshKeys(id).then(response => {
        if (response.code === 0) {
          this.$parent.fetchData()
          this.dialogFormVisible = false
          this.$message({
            type: 'success',
            message: '刷新成功!'
          })
        }
      })
    }
  }
}
</script>
