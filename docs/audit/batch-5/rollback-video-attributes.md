# Batch 5 rollback: original video attributes (2026-10-09, before any change)

Restore with `data_element_tool › set_attributes` (and `remove_attribute` for
`poster` / `media`) on these DOM elements.

| Page | Element id | Tag | Original attributes |
| --- | --- | --- | --- |
| Home | 03c67888-096e-2874-cbaf-28f3a2403646 | video | autoplay, loop, muted, playsinline, webkit-playsinline, preload=auto (no poster) |
| Home | 03c67888-096e-2874-cbaf-28f3a2403647 | source | src=`https://cdn.prod.website-files.com/69cc1149c7144d8f6b6c386a%2F6a95a2d0eac283909f862781_WULF%20Website%20Promo%20%281%29_webm.webm` type=video/webm |
| Home | d37377e3-d305-ab91-95f2-dc9709f34066 | source | src=`…6a95a2d0eac283909f862781_WULF%20Website%20Promo%20%281%29_mp4.mp4` type=video/mp4 (unchanged) |
| About | 8a7915e7-10ff-7931-40ce-937d5b402e02 | video | autoplay, loop, muted, playsinline, webkit-playsinline, preload=auto (no poster) |
| About | 8a7915e7-10ff-7931-40ce-937d5b402e03 | source | src=`https://cdn.prod.website-files.com/69cc1149c7144d8f6b6c386a%2F6ab1631a24e5828ab2fa7612_The%20Evolution%20of%20Energy_Final_v2%20%281%29_mp4.mp4` type=video/mp4 |
| About | 7ac36954-17b5-c4ef-0b01-a619d3049759 | source | src=`https://cdn.prod.website-files.com/69cc1149c7144d8f6b6c386a%2F6ab1631a24e5828ab2fa7612_The%20Evolution%20of%20Energy_Final_v2%20%281%29_webm.webm` type=video/webm |
| Careers | 62301b2f-7b26-e588-baa5-4cd2d877a92d | video | autoplay, loop, muted, playsinline, webkit-playsinline, preload=auto (no poster) |
| Careers | 62301b2f-7b26-e588-baa5-4cd2d877a92e | source | src=`https://s3.amazonaws.com/webflow-prod-assets/69cc1149c7144d8f6b6c386a/6a0decb95e649c97034f5dd8_YTDown_YouTube_TeraWulf-s-Topping-Out-Ceremony-Lake-Mar_Media_EPB3uiyWuoo_001_1080p%20(1).mp4` type=video/mp4 |

Page ids: Home 69cc114bc7144d8f6b6c38b4, About 69ceb1e6dace149b16d5387b,
Careers 69f6bd59ac1fe58792b40e93. Popup videos (`data-popup-video`) are not
touched.
