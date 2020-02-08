{% if theme.footer.beian.enable %}
  <div class="footer-beian">
    <a href="http://www.beian.miit.gov.cn/" target="_blank">{{ theme.footer.beian.icp }}</a>&nbsp;|&nbsp;
    <!-- <a target="_blank" href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode={{theme.footer.beian.gongan_beian_recordcode}}">{{theme.footer.beian.gongan_beian_number}}</a> -->
    <img src="{{theme.footer.beian.gongan_icon_url}}" alt="">
    <a target="_blank" href="http://www.beian.gov.cn/">{{theme.footer.beian.gongan_beian_number}}</a>
  </div>
{% endif %}